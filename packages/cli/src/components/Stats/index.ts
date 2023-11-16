import { cliText } from '@common/localization/cliText';
import { Command } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from '../Cli/util';
import { resolve } from 'node:path';
import { initializeCommand } from '../Cli/initializeCommand';
import { IR } from '@common/utils/types';
import { gatherArticles } from './gatherArticles';
import { tagsToFileMeta } from './getFileTags';

export const registerStatsCommand = (program: Command<[], {}>) =>
  program
    .command('stats')
    .description(cliText.statsCommandDescription)
    .option(
      '--cwd <path>',
      cliText.cwdOptionDescription,
      resolveRepositoryPath,
      process.cwd(),
    )
    .option(
      '--html <path>',
      cliText.htmlOptionDescription,
      resolve,
      './stats.html',
    )
    .option('--no-auto-open', cliText.noAutoOpenOptionDescription)
    .option(
      '--json <path>',
      cliText.jsonOptionDescription,
      resolve,
      './stats.json',
    )
    .option('--no-pull', cliText.noPullOptionDescription)
    .action(async ({ cwd, html, autoOpen, json, pull }) => {
      const { git, years, tags } = await initializeCommand(cwd, pull);

      const filesWithTags = await tagsToFileMeta(tags, git);
      const results = await gatherArticles(cwd, filesWithTags);
      console.log(filesWithTags, results);
      console.log({
        cwd,
        html,
        autoOpen,
        json,
        pull,
        years,
        tags,
      });

      // TODO: handle git not being installed
    });

type StatsJson = {
  readonly allStats: StatsStructure;
  readonly perTag: IR<StatsStructure>;
  readonly perYear: IR<StatsStructure>;
};

type StatsStructure = StatsCounts & {
  readonly perDay: IR<StatsCounts>;
  readonly perHost: IR<StatsCounts>;
  readonly words: IR<number>;
};

type StatsCounts = {
  readonly total: Counts;
  readonly average: Counts;
};

type Counts = {
  readonly count: number;
  readonly length: number;
  readonly words: number;
  readonly sentences: number;
  readonly paragraphs: number;
  readonly uniqueWords: number;
};
