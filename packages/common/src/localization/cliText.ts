/**
 * Localization strings used by the CLI script
 */

import { commonText } from '@common/localization/commonText';
import { dictionary } from './utils';
import { initialContent } from '../../../browser-extension/src/components/Auth/initialContent';
import { urls } from '../../../browser-extension/config';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const cliText = dictionary({
  textHoarderCli: {
    en: 'npx text-hoarder',
  },
  commandDescription: {
    en: `A companion CLI app for the ${commonText.textHoarder} browser extension. The browser extension saves webpages to a GitHub repository. This CLI app then works with the local clone of the GitHub repository to provide insights into your most commonly saved webpages. This CLI also has a convenience utility for optimizing exported articles for text-to-speech`,
  },
  statsCommandDescription: {
    en: 'Generate statistics from saved articles',
  },
  statsCommandProgress: {
    en: 'Computing statistics...',
  },
  finalizingOutput: {
    en: 'Finalizing output...',
  },
  cwdRepositoryOptionDescription: {
    en: 'the repository to run the command in. Defaults to current directory',
  },
  cwdOptionDescription: {
    en: 'the folder to run the command in. Defaults to current directory',
  },
  htmlOptionDescription: {
    en: 'the path at which an HTML file with computed stats would be emitted',
  },
  noAutoOpenOptionDescription: {
    en: 'do not automatically open the generated HTML file in the browser',
  },
  preciseStatsOptionDescription: {
    en: 'compute a much more accurate word and sentence count, but a lot slower',
  },
  jsonOptionDescription: {
    en: 'the path at which a JSON file with computed stats would be emitted',
  },
  noPullOptionDescription: {
    en: `do not automatically try to pull the latest changes from GitHub. \nNote, this means ${commonText.textHoarder} might not know about recently saved articles. \nYou can also manually pull recent changes by running "git pull"`,
  },
  processCommandDescription: {
    en: 'Process articles saved since last processing, and optimize them for text-to-speech conversion',
  },
  sinceTagOptionDescription: {
    en: 'only process articles saved since the specified tag was created \nTag is usually a date in format YYYY-MM-DD. Run "git tag" to see existing tags.',
  },
  sinceTagOptionDefaultDescription: {
    en: 'most recently created tag',
  },
  tillTagOptionDescription: {
    en: 'only process articles saved until the specified tag was created \nTag is usually a date in format YYYY-MM-DD. Run "git tag" to see existing tags. \nBy default would process all articles till today',
  },
  createTagOptionDescription: {
    en: "the name of the git tag to create when processing is complete. \nThis will make it easy in the future to only process articles saved since today's run",
  },
  noCreateTagOptionDescription: {
    en: 'do not automatically create a git tag name for this "text-hoarder process" run. \nNew tag is created automatically, unless --since-tag or --till-tag was specified',
  },
  forceCreateTagOptionDescription: {
    en: 'if tag name specified in --create-tag already exists, then overwrite it, rather than failing',
  },
  untagged: {
    en: '(untagged)',
  },
  findSpamCommandDescription: {
    en: `Find commonly repeated lines in text file, which likely indicate spam/advertisement that should be excluded. \nFor example 'Advertisement', 'RECOMMENDED VIDEOS FOR YOU', and other trash`,
  },
  globOptionDescription: {
    en: 'file/folder to search for spam (path or glob pattern). \nNote, when providing a glob pattern, it should be enclosed in quotes',
  },
  noDefaultExcludeOptionDescription: {
    en: `do not exclude common spam lines by default. \nSee default exclude list at ${urls.excludeList}`,
  },
  excludeListOptionDescription: {
    en: `path to a file containing spam lines to exclude from the reporting. \nEach line in the file is considered a spam line. \n(default: nearest "${initialContent.excludeList.name}" file)`,
  },
  limitOptionDescription: {
    en: 'maximum number of spam lines to report. Set to 0 to disable the limit',
  },
  showCountsOptionDescription: {
    en: 'show the occurrence count of each spam line',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
