/**
 * Localization strings used for commit messages
 *
 * All commit messages are defined in a single file so that they look
 * consistent (if they are defined in multiple places, easy to forget the
 * style and create an inconsistent commit message)
 */

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

import { commonText } from './commonText';
import { dictionary } from './utils';

/* eslint-disable @typescript-eslint/naming-convention */
export const commitText = dictionary({
  repositoryInitialize: {
    en: (documentTitle: string): string =>
      `[${commonText.delete}] ${documentTitle}`,
  },
  initialize: { en: 'Initialize Text Hoarder' },
  createFile: { en: (documentTitle: string): string => documentTitle },
  readmeContent: {
    en: (
      webStoreUrl: string,
      webStoreReviewUrl: string,
    ) => `# Text Hoarder Store

This repository is used by the [Text Hoarder](${webStoreUrl}) browser extension
for storage of saved snippets of text.

If you are enjoying it, don't forget to [leave a review](${webStoreReviewUrl}) 
on the Chrome Web Store!

// FINAL: improve this
`,
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
