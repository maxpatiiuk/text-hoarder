/**
 * Localization strings for all UI components (except for preferences)
 */

import { commonText } from '@common/localization/commonText';
import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const readerText = dictionary({
  readerMode: { en: 'Reader Mode' },
  loading: { en: 'Loading...' },
  noContentFound: { en: 'Unable to find readable content on the page' },
  tools: { en: 'Tools' },
  aboutTextHoarder: { en: `About ${commonText.textHoarder}` },
  sourceCode: { en: 'Source code' },
  reportIssue: { en: 'Report an issue' },
  requestFeature: { en: 'Request a feature' },
  leaveReview: { en: 'Leave a review' },
  saveToGitHub: { en: 'Save to GitHub' },
  editOnGitHub: { en: 'Edit on GitHub' },
  recentlySaved: { en: 'This article has already been saved recently' },
  saveAgain: { en: 'Save again' },
  savedToGitHub: { en: 'Saved to GitHub!' },
  edit: { en: 'Edit' },
});
/* eslint-enable @typescript-eslint/naming-convention */
