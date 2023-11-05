/**
 * Localization strings used by the CLI script
 */

import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const cliText = dictionary({
  commandDescription: {
    en: `A companion CLI app for the Text Hoarder browser extension. The browser
    extension saves webpages to a GitHub repository. This CLI app then worked
    with the local clone of the GitHub repository to provide insights into your
    most commonly saved webpages. This CLI also has a convenience utility for
    optimizing exported articles for text-to-speech`,
  },
  statsCommandDescription: {
    en: 'Generate statistics from saved articles',
  },
  cwdOptionDescription: {
    en: 'The repository to run the command in. Defaults to current directory',
  },
  htmlOptionDescription: {
    en: 'The path at which an HTML file with computed stats would be emitted',
  },
  noAutoOpenOptionDescription: {
    en: 'Do not automatically open the generated HTML file in the browser',
  },
  jsonOptionDescription: {
    en: 'The path at which a JSON file with computed stats would be emitted',
  },
  noPullOptionDescription: {
    en: 'Do not automatically try to pull the latest changes from GitHub',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
