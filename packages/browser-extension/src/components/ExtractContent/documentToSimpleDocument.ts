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
function htmlDecode(input: string): string {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent ?? input;
}
