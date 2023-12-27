import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { SimpleDocument } from './documentToSimpleDocument';

/**
 * Convert simple document to markdown to be saved to GitHub repository
 */
export function simpleDocumentToMarkdown(
  simpleDocument: SimpleDocument,
): string {
  return `# ${simpleDocument.title}\n\n${elementToMarkdown(
    simpleDocument.content,
  )}`;
}

// LOW: add customization options
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});
turndownService.use(gfm);

function elementToMarkdown(element: HTMLElement): string {
  try {
    return turndownService
      .turndown(element)
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
  } catch (error) {
    console.error(error);
    return element.innerHTML;
  }
}
