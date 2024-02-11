/**
 * Localization strings that are common between multiple bundles
 */

import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const commonText = dictionary({
  textHoarder: { en: 'Text Hoarder' },
  delete: { en: 'Delete' },
  filePickerMessage: {
    en: 'Choose a file or drag it here',
  },
  colonLine: {
    en: (label: string, value: string) => `${label}: ${value}`,
  },
  selectedFileName: {
    en: 'Selected file',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
