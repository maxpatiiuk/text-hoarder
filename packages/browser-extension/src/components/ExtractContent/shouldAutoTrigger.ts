/**
 * Inspired by
 * https://searchfox.org/mozilla-central/source/toolkit/components/reader
 */

import { isProbablyReaderable } from '@mozilla/readability';

const blockedExtensions: ReadonlySet<string> = new Set(['json', 'pdf', 'xml']);

export function shouldAutoTrigger(): boolean {
  if (location.pathname === '/') return false;

  const extension = location.pathname.split('.').at(-1);
  if (blockedExtensions.has(extension ?? '')) return false;

  if (!isProbablyReaderable(document)) return false;

  return document.readyState === 'complete';
}
