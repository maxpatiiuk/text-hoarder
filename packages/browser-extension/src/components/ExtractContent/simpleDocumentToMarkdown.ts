import TurndownService from '@joplin/turndown';
import { gfm } from '@joplin/turndown-plugin-gfm';
import { SimpleDocument } from './documentToSimpleDocument';
import { encoding } from '@common/utils/encoding';

/**
 * Convert simple document to markdown to be saved to GitHub repository
 */
export function simpleDocumentToMarkdown(
  simpleDocument: SimpleDocument,
  includeArticleUrl: boolean,
): string {
  return `# ${simpleDocument.title}\n\n${includeArticleUrl ? `${getCleanUrl()}\n\n` : ''}${elementToMarkdown(
    simpleDocument.content,
  )}`;
}

/**
 * During url to path conversion, we clean up the URL - run the process and
 * reverse to get a cleaner URL
 */
function getCleanUrl(): string {
  const raw = window.location.href;
  const encoded = encoding.urlToPath.encode(0, raw);
  const decoded = encoding.urlToPath.decode(encoded)[1];
  return decoded;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});
turndownService.use(gfm);

// Workaround for https://github.com/laurent22/joplin/issues/9885
const tableRule = turndownService.rules.array[2];
if (!tableRule.filter.toString().includes('TABLE'))
  throw new Error('Incorrect rule selected. Expected to find table rule');
tableRule.filter = ['table'];
if (tableRule.replacement?.toString().toLowerCase().includes('caption'))
  throw new Error(
    'Turndown received caption support - workaround should be removed',
  );
const originalReplacement = tableRule.replacement;
tableRule.replacement = (content, node, ...rest) => {
  const caption = (node as HTMLTableElement).caption?.textContent || '';
  const table = originalReplacement?.(content, node, ...rest) ?? '';
  return caption === '' ? table : `${caption}\n\n${table.trimStart()}`;
};

turndownService.remove(['caption', 'colgroup', 'col']);

export function elementToMarkdown(element: HTMLElement): string {
  try {
    return turndownService
      .turndown(element)
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
  } catch (error) {
    console.error(error);
    return element.innerText.replaceAll('.', '.\n');
  }
}
