/**
 * Based on https://github.com/ankit/stylebot/blob/main/src/background/utils.ts
 * but simplified and modernized
 */

import { RA, isDefined } from '@common/utils/types';

export const preparePatterns = (patterns: string): RA<string | RegExp> =>
  patterns
    .split('\n')
    // Exclude comments
    .filter((line) => !line.startsWith('#') && line.length > 0)
    .map((pattern) => {
      const isRegex = pattern.startsWith('^');
      return (
        (isRegex ? parseRegex(pattern) : undefined) ??
        (pattern.includes('*')
          ? parseRegex(wildcardToRegex(pattern))
          : undefined) ??
        pattern
      );
    })
    .filter(isDefined);

const reHostname = /\w+(?:\.\w+)+/;
export const extractOrigins = (
  patterns: RA<string | RegExp>,
): ReadonlySet<string> =>
  new Set(
    patterns
      .map((pattern) => pattern.toString().match(reHostname)?.[0])
      .filter(isDefined),
  );

function parseRegex(pattern: string): RegExp | undefined {
  try {
    return new RegExp(pattern, 'i');
  } catch {
    return undefined;
  }
}

const wildcardToRegex = (pattern: string): string =>
  pattern
    // Escape . ? | ( ) [ ] + $ ^ \ { }
    .replaceAll(/(\.|\?|\||\(|\)|\[|\]|\+|\$|\^|\\|\{|\})/g, '\\$1')
    // Let `**` mean match anything
    .replaceAll(/\*\*/g, '.*')
    /*
     * Let `*` mean match anything but /. Since `**` was replaced with `.*`,
     * have to make sure `*` in `.*` isn't replaced again.
     * Thus, replace `*` only if it is not preceded by `.` (unless it is an
     * escaped dot - `\.`)
     */
    .replaceAll(/(?<!(?<!\\)\.)\*/g, '[^/]*');

export const urlMatches = (
  href: string,
  patterns: RA<string | RegExp>,
): boolean =>
  patterns.some((pattern) =>
    typeof pattern === 'string'
      ? isTextMatch(href, pattern)
      : isRegexMatch(href, pattern),
  );

const isRegexMatch = (href: string, pattern: RegExp): boolean =>
  pattern.test(href);

const exactMatchParts: RA<keyof URL> = ['username', 'password', 'port', 'hash'];

function isTextMatch(href: string, pattern: string): boolean {
  const currentUrl = new URL(href);
  const hasProtocol = pattern.match(/^(\w+:)\/\//);
  const matchUrl = toUrl(hasProtocol ? pattern : `//${pattern}`, href);
  if (matchUrl === undefined) return false;

  const hasPathname = matchUrl.pathname.length > 1;
  const shouldMatchHostStrictly = hasProtocol || hasPathname;

  const hostMatches = shouldMatchHostStrictly
    ? currentUrl.host === matchUrl.host
    : `.${currentUrl.hostname}`.endsWith(`.${matchUrl.hostname}`);

  return (
    hostMatches &&
    (!hasPathname ||
      `${currentUrl.pathname}/`.startsWith(`${matchUrl.pathname}/`)) &&
    currentUrl.protocol === matchUrl.protocol &&
    exactMatchParts.every(
      (part) => !matchUrl[part] || currentUrl[part] === matchUrl[part],
    ) &&
    Array.from(matchUrl.searchParams).every(
      ([name, value]) => currentUrl.searchParams.get(name) === value,
    )
  );
}

function toUrl(pattern: string, base?: string): URL | undefined {
  try {
    return new URL(pattern, base);
  } catch {
    return undefined;
  }
}
