import { Readability } from '@mozilla/readability';

export type SimpleDocument = Exclude<
  ReturnType<Readability<HTMLElement>['parse']>,
  null
>;

/**
 * Create simplified DOM based on page's DOM
 */
export function documentToSimpleDocument(): undefined | SimpleDocument {
  const documentClone = document.cloneNode(true) as Document;

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
    return (
      // LOW: add customization options
      new Readability(documentClone, {
        serializer: (node) => node as HTMLElement,
        classesToPreserve: Array.from(preserveClassNames),
        // FEATURE: extend the unlikely candidates regex? Inspiration: https://github.com/lindylearn/unclutter/blob/main/apps/unclutter/source/content-script/modifications/contentBlock.ts#L126
      }).parse() ?? undefined
    );
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
