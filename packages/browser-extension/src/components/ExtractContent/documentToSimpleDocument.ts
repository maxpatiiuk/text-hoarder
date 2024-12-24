import { silenceError } from '@common/components/Errors/assert';
import { Readability } from '@mozilla/readability';

export type SimpleDocument = Exclude<
  ReturnType<Readability<HTMLElement>['parse']>,
  null
>;

/**
 * Create simplified DOM based on page's DOM
 */
export function documentToSimpleDocument(
  documentClone = document.cloneNode(true) as Document,
): undefined | string | SimpleDocument {
  /**
   * Preserve syntax-highlighting related class names (used in GitHub
   * codeblocks). Also used by turndown-plugin-gfm to output correct language
   * identifier for fenced code blocks when converting HTML to Markdown.
   */
  const preserveClassNames = new Set<string>();
  Array.from(
    documentClone.querySelectorAll(
      '.highlight, pre, code, :is(.highlight, pre, code) span',
    ),
    (node) => {
      Array.from(node.classList).forEach((className) =>
        preserveClassNames.add(className),
      );
    },
  );

  try {
    const result =
      new Readability(documentClone, {
        serializer: (node) => node as HTMLElement,
        classesToPreserve: Array.from(preserveClassNames),
        // LOW: extend the unlikely candidates regex? Inspiration: https://github.com/lindylearn/unclutter/blob/main/apps/unclutter/source/content-script/modifications/contentBlock.ts#L126
      }).parse() ?? undefined;
    if (result === undefined) return undefined;
    return {
      ...result,
      // Workaround for https://github.com/mozilla/readability/issues/820
      title:
        typeof result.title === 'string'
          ? silenceError(() => htmlDecode(result.title)) ?? result.title
          : result.title,
    };
  } catch (error) {
    console.error(error);
    return error instanceof Error ? error.message : String(error);
  }
}

// From https://stackoverflow.com/a/34064434/8584605
export function htmlDecode(input: string): string {
  if (globalThis.DOMParser === undefined) return unescape(input);
  const doc = new globalThis.DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent ?? input;
}

/**
 * Based on https://github.com/markedjs/marked/blob/476b85e99ae4101d8cf94957328f70777c911b2c/src/helpers.ts#L29
 */
const unescape = (input: string): string =>
  input.replace(reUnescapeTest, (_, n) => {
    n = n.toLowerCase();
    const replacement = escapeReplacements[n];
    if (replacement) return replacement;
    else if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
const escapeReplacements: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
};
const reUnescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));/gi;
