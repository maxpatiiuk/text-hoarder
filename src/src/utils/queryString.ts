import type { IR } from './types';

/**
 * Add query string parameters to a URL. Preserve current parameters if present
 */
export function formatUrl(url: string, parameters: IR<string>): string {
  const urlObject = new URL(url, getUrl());
  urlObject.search = new URLSearchParams({
    ...Object.fromEntries(urlObject.searchParams),
    ...parameters,
  }).toString();
  // If received a URL without hostname, return a URL without hostname
  return url.startsWith('/')
    ? `${urlObject.pathname}${urlObject.search}${urlObject.hash}`
    : urlObject.toString();
}

const getUrl = (): string => globalThis.location?.href ?? 'http://localhost/';

/* Use "useSearchParam" instead of this whenever possible */
export const parseUrl = (url: string = getUrl()): IR<string> =>
  Object.fromEntries(new URL(url, getUrl()).searchParams);
