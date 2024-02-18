/**
 * Localization strings used by the CLI script
 */

import { commonText } from '@common/localization/commonText';
import { dictionary } from './utils';
import { initialContent } from '../../../browser-extension/src/components/Auth/initialContent';
import { urls } from '../../../browser-extension/config';
import {
  formatConjunction,
  formatNumber,
} from '@common/components/Atoms/Internationalization';
import { RA } from '@common/utils/types';

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
  processingFiles: {
    en: 'Processing files...',
  },
  repositoryOptionDescription: {
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
    en: 'Optimizes saved articles for text-to-speech software (removes likely spam and advertisement lines, removes characters that are not friendly with text-to-speech software, and etc). \nThis command also converts markdown files to plaintext and splits large articles into smaller files to work around the max length limit in some text-to-speech tools. \nBy default, processes all new articles saved since the last time this command was run',
  },
  sinceTagOptionDescription: {
    en: 'only process articles saved since the specified Git tag was created \nTag is usually a date in a format YYYY-MM-DD. Run "git tag" to see existing tags.',
  },
  sinceTagOptionDefaultDescription: {
    en: 'most recently created tag',
  },
  noSinceTagOptionDescription: {
    en: 'process all article from the very first ever saved',
  },
  tillTagOptionDescription: {
    en: 'only process articles saved until the specified Git tag was created \nTag is usually a date in a format YYYY-MM-DD. Run "git tag" to see existing tags. \nBy default would process all articles till today',
  },
  createTagOptionDescription: {
    en: "the name of the Git tag to create when processing is complete. \nThis will make it easy in the future to only process articles saved since today's run",
  },
  noCreateTagOptionDescription: {
    en: 'do not automatically create a git tag name for this "text-hoarder process" run. \nNew tag is created automatically, unless --since-tag or --till-tag was specified',
  },
  forceCreateTagOptionDescription: {
    en: 'if tag name specified in --create-tag already exists, then overwrite it, rather than throw an error',
  },
  untagged: {
    en: '(untagged)',
  },
  findSpamCommandDescription: {
    en: `Find commonly repeated lines in text file, which likely indicate spam/advertisement that should be excluded. \nFor example 'Advertisement', 'RECOMMENDED VIDEOS FOR YOU', and other trash`,
  },
  globOptionDescription: {
    en: 'file/folder to search for spam (path or glob pattern). \nNote, when providing a glob pattern, it should be enclosed in quotes. \nSee full glob syntax: https://www.npmjs.com/package/glob#glob-primer\nCan provide multiple space-separated values. \nIf markdown files are provided, they are converted to plain-text automatically',
  },
  optionalGlobOptionDescription: {
    en: 'instead of processing a repository, process specific file or folders (path or glob pattern). \nNote, when providing a glob pattern, it should be enclosed in quotes. \nSee full glob syntax: https://www.npmjs.com/package/glob#glob-primer. \nCan provide multiple space-separated values \nIf markdown files are provided, they are converted to plain-text automatically',
  },
  noDefaultExcludeOptionDescription: {
    en: `do not exclude common spam lines by default. \nSee default exclude list at ${urls.excludeList}`,
  },
  excludeListOptionDescription: {
    en: `path to a file containing spam lines to exclude. \nEach line in the file is considered a spam line. \n(default: nearest "${initialContent.excludeList.name}" file)`,
  },
  limitOptionDescription: {
    en: 'maximum number of spam lines to report. Set to 0 to disable the limit',
  },
  showCountsOptionDescription: {
    en: 'show the occurrence count of each spam line',
  },
  outputDirOptionDescription: {
    en: 'the folder to output the processed articles to',
  },
  processedFiles: {
    en: (totalFiles: number, timePassed: number) =>
      `Processed ${formatNumber(totalFiles)} files in ${timePassed}s`,
  },
  processStatsResult: {
    en: (
      originalLines: number,
      originalNonEmptyLines: number,
      finalLines: number,
    ) =>
      `In the process, reduced the total number of lines from ${formatNumber(
        originalLines,
      )} (${formatNumber(
        originalNonEmptyLines,
      )} non-blank) down to ${formatNumber(finalLines)}`,
  },
  outputPathTooLong: {
    en: 'Warning: Output directory path might be too long for Windows',
  },
  splitOptionDescription: {
    en: 'split a processed article if it is longer than this number of characters. Pass 0 to disable splitting',
  },
  forceOutputDirOptionDescription: {
    en: 'overwrite output directory even if it already exists',
  },
  noExcludeDuplicatedLinesOptionDescription: {
    en: 'do not automatically remove duplicated lines between articles',
  },
  outputDirAlreadyExits: {
    en: (outputDir: string) =>
      [
        `Output directory already exists (${outputDir}).`,
        'Please provide a different directory using --output-dir',
        'Or, add --force-output-dir to overwrite existing directory',
      ].join('\n'),
  },
  ignoringSinceTag: {
    en: 'Ignoring --since-tag because --glob was specified',
  },
  ignoringTillTag: {
    en: 'Ignoring --till-tag because --glob was specified',
  },
  ignoringCreateTag: {
    en: 'Ignoring --create-tag because --glob was specified',
  },
  ignoringForceCreateTag: {
    en: 'Ignoring --force-create-tag because --glob was specified',
  },
  ignoringCreateTagAlt: {
    en: 'Ignoring --create-tag because --since-tag or --till-tag was specified',
  },
  duplicateTag: {
    en: (newTag: string) =>
      `Tag ${newTag} already exists. Use --force-create-tag to overwrite`,
  },
  unknownTag: {
    en: (tag: string, existingTags: RA<string>) =>
      [
        `Tag ${tag} does not exist.`,
        existingTags.length === 0
          ? ''
          : ` Existing tags are: ${formatConjunction(existingTags)}`,
      ].join('\n'),
  },
  tagPushError: {
    en: (error: string) =>
      [
        'Failed to automatically push the newly created tag to GitHub. Error:',
        error,
        '',
        'You can manually push the tag by running "git push --tags"',
      ].join('\n'),
  },
  gitNotInstalled: {
    en: 'Git is not installed. Please install it and try again: https://git-scm.com/downloads',
  },
  repositoryPathResolveError: {
    en: (path: string) =>
      `Could not find a ${commonText.textHoarder} repository at ${path}. If this is a new repository, please make sure to save at least one article before running this command`,
  },
  outputted: {
    en: (outputDir: string) =>
      `Processing is complete. Outputted processed articles to ${outputDir}`,
  },
  noGlobMatches: {
    en: [
      'No files matched the provided pattern.',
      'See glob syntax: https://www.npmjs.com/package/glob#glob-primer',
    ].join('\n'),
  },
  processingFromTags: {
    en: (tags: RA<string>) =>
      `Processing all articles created in the following tags: ${formatConjunction(
        tags,
      )}`,
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
