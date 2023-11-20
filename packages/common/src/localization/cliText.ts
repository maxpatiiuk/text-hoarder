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
  statsCommandProgress: {
    en: 'Computing statistics...',
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
    en: 'Do not automatically try to pull the latest changes from GitHub. \nNote, this means Text Hoarder might not know about recently saved articles. \nYou can also manually pull recent changes by running "git pull"',
  },
  processCommandDescription: {
    en: 'Process articles saved since last processing, and optimize them for text-to-speech conversion',
  },
  sinceTagOptionDescription: {
    en: 'Only process articles saved since the specified tag was created \nTag is usually a date in format YYYY-MM-DD. Run "git tag" to see existing tags.',
  },
  sinceTagOptionDefaultDescription: {
    en: 'most recently created tag',
  },
  tillTagOptionDescription: {
    en: 'Only process articles saved until the specified tag was created \nTag is usually a date in format YYYY-MM-DD. Run "git tag" to see existing tags. \nBy default would process all articles till today',
  },
  createTagOptionDescription: {
    en: "The name of the git tag to create when processing is complete. \nThis will make it easy in the future to only process articles saved since today's run",
  },
  noCreateTagOptionDescription: {
    en: 'Do not automatically create a git tag name for this "text-hoarder process" run. \nNew tag is created automatically, unless --since-tag or --till-tag was specified',
  },
  forceCreateTagOptionDescription: {
    en: 'If tag name specified in --create-tag already exists, then overwrite it, rather than failing',
  },
  untagged: {
    en: '(untagged)',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
