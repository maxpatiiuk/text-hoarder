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
  return (
    // FEATURE: add customization options
    new Readability(documentClone, {
      serializer: (node) => node as HTMLElement,
      /**
       * Don't remove class names because turndown relies on some well-known
       * class names for proper code block language detection.
       *
       * And since page is displayed in shadow dom, none of the previous class
       * name styles should interfere
       */
      keepClasses: true,
    }).parse() ?? undefined
  );
}
