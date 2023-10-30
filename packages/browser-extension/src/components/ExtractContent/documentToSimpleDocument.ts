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
  try {
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
        // FIXME: this looks bad for pages that use tailwind - replace with allowlist based on https://searchfox.org/mozilla-central/source/toolkit/components/reader/ReaderMode.sys.mjs#18 (and preserve styles?) and what is used by turndown
        keepClasses: true,
        // FEATURE: extends the unlikely candidates regex? https://github.com/lindylearn/unclutter/blob/main/apps/unclutter/source/content-script/modifications/contentBlock.ts#L126
      }).parse() ?? undefined
    );
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
