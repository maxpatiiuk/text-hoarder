import { markdownToTxt } from 'markdown-to-txt';

/**
 * Convert markdown to text.
 */
export function markdownToText(markdown: string): string {
  return markdownToTxt(markdown, {
    // LOW: add customization options
    // LOW: allow omitting images
    //renderer: {image: ()=>''}
  });
}
