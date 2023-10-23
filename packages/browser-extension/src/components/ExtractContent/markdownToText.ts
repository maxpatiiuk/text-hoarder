import { markdownToTxt } from 'markdown-to-txt';

/**
 * Convert markdown to text.
 */
export function markdownToText(markdown: string): string {
  return markdownToTxt(markdown, {
    // FEATURE: add customization options
    // FEATURE: allow omitting images
    //renderer: {image: ()=>''}
  });
}
