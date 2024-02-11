import { markdownToTxt } from 'markdown-to-txt';

/**
 * Convert markdown to text.
 */
export const markdownToText = (markdown: string): string =>
  markdownToTxt(markdown);
