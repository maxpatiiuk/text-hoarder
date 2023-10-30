/**
 * Inspired by
 * https://searchfox.org/mozilla-central/source/toolkit/components/reader
 */

import { isProbablyReaderable } from '@mozilla/readability';

// LOW: if is json or xml text, than pretty-print and add syntax-highlighting?
const blockedExtensions: ReadonlySet<string> = new Set(['json', 'pdf', 'xml']);

export function shouldAutoTrigger(): boolean {
  if (location.pathname === '/') return false;

  const extension = location.pathname.split('.').at(-1);
  if (blockedExtensions.has(extension ?? '')) return false;

  // FEATURE: fetch page as HTML again? https://searchfox.org/mozilla-central/source/toolkit/components/reader/ReaderMode.sys.mjs#261. ChatGPT says content before JS may be better - fewer ads and non-essential content
  // FEATURE: scroll to reference: https://searchfox.org/mozilla-central/source/toolkit/components/reader/AboutReader.sys.mjs#1263
  // FEATURE: make reader create new history entry?
  // FEATURE: if some text was selected, enable reader for it only?
  // FEATURE: if was in reader mode, and clicked on same-origin link, remain in reader mode?

  if (!isProbablyReaderable(document)) return false;

  return document.readyState === 'complete';
}
