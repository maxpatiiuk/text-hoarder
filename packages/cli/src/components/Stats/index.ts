import fs from 'node:fs/promises';

import { cliText } from '@common/localization/cliText';
import { Command } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from '../Cli/util';
import { resolve } from 'node:path';
import { initializeCommand } from '../Cli/initializeCommand';
import { gatherArticles } from './gatherArticles';
import { tagsToFileMeta } from './getFileTags';
import { computeStats } from './computeStats';

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
      const { git, tags } = await initializeCommand(cwd, pull);

      const filesWithTags = await tagsToFileMeta(tags, git);
      const articles = await gatherArticles(cwd, filesWithTags);
      const stats = computeStats(articles, tags.length > 0);
      console.log({
        cwd,
        html,
        autoOpen,
        json,
        pull,
        tags,
        filesWithTags,
        articles,
        stats,
      });

      if (typeof json === 'string')
        await fs.writeFile(json, JSON.stringify(stats));

      // FIXME: add HTML reporter
      // TODO: handle git not being installed
    });
