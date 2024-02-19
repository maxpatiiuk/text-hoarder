/**
 * Localization strings used for commit messages
 *
 * All commit messages are defined in a single file so that they look
 * consistent (if they are defined in multiple places, easy to forget the
 * style and create an inconsistent commit message)
 */

import { readerText } from '@common/localization/readerText';
import { urls } from '../../../browser-extension/config';
import { commonText } from './commonText';
import { dictionary } from './utils';
import { signInText } from '@common/localization/signInText';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const commitText = dictionary({
  // Not using conventional commits as those might look weird to non-techy users
  repositoryInitialize: {
    en: (documentTitle: string): string =>
      `${commonText.textHoarder}: ${commonText.delete} "${documentTitle}"`,
  },
  initialize: { en: `${commonText.textHoarder}: Initialize` },
  createFile: {
    en: (fileName: string) => `${commonText.textHoarder}: Create ${fileName}`,
  },
  saveArticle: { en: (title: string) => title },
  // FIXME: figure out mechanism for keeping this readme updated without overwriting user changes - or simpler yet, just provide a link to a readme hosted in text-hoarder repository
  // FIXME: try out the html in svg idea to embed html page in here???
  // FIXME: if readme exists, but contains only one line, overwrite it - i.e the default github readme
  readmeContent: {
    en: (owner: string, repo: string) => `# ${commonText.textHoarder} Store

This repository is used by the [${commonText.textHoarder}](${urls.webStore}) browser extension
for storage of saved snippets of text.

Did you know that ${commonText.textHoarder} can compute fancy stats from the articles you
saved? It can do even more than that! [See a full guide to ${commonText.textHoarder}](${urls.cliDocs}).

A quick start to text-hoarder CLI:

\`\`\`
git clone https://github.com/${owner}/${repo}
cd ${repo}
npm install
npx text-hoarder --help
\`\`\`

If you are enjoying ${commonText.textHoarder}, don't forget to
[leave a review](${urls.webStoreReview}) on the Chrome Web Store!

Helpful links:
- [${readerText.requestFeature}](${urls.requestFeature})
- [${readerText.reportIssue}](${urls.reportIssue})
- [${readerText.sourceCode}](${urls.sourceCode})
- [${signInText.privacyPolicy}](${urls.privacyPolicy})
`,
  },
  textHoarderStoreDescription: {
    en: `A repository used by ${commonText.textHoarder} browser extension to store text snippets`,
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
