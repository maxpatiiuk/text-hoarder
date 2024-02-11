/**
 * Localization strings used for commit messages
 *
 * All commit messages are defined in a single file so that they look
 * consistent (if they are defined in multiple places, easy to forget the
 * style and create an inconsistent commit message)
 */

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

import { readerText } from '@common/localization/readerText';
import { urls } from '../../../browser-extension/config';
import { commonText } from './commonText';
import { dictionary } from './utils';
import { signInText } from '@common/localization/signInText';

/* eslint-disable @typescript-eslint/naming-convention */
export const commitText = dictionary({
  // Not using conventional commits as those might look weird to non-techy users
  repositoryInitialize: {
    en: (documentTitle: string): string =>
      `[${commonText.delete}] ${documentTitle}`,
  },
  initialize: { en: 'Initialize Text Hoarder' },
  createFile: { en: (documentTitle: string): string => documentTitle },
  readmeContent: {
    en: `# Text Hoarder Store

This repository is used by the [Text Hoarder](${urls.webStore}) browser extension
for storage of saved snippets of text.

Did you know that Text Hoarder can compute fancy stats from the articles you
save? [See a guide](${urls.statsDocs}).

If you are enjoying Text Hoarder, don't forget to
[leave a review](${urls.webStoreReview}) on the Chrome Web Store!

Helpful links:
- [${readerText.requestFeature}](${urls.requestFeature})
- [${readerText.reportIssue}](${urls.reportIssue})
- [${readerText.sourceCode}](${urls.sourceCode})
- [${signInText.privacyPolicy}](${urls.privacyPolicy})
`,
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
