import fs from 'node:fs/promises';
import open from 'open';
import { resolve, relative } from 'node:path';

import { cliText } from '@common/localization/cliText';
import { Command } from '@commander-js/extra-typings';
import { distPath, resolveRepositoryPath } from '../Cli/util';
import { initializeCommand } from '../Cli/initializeCommand';
import { gatherArticles } from './gatherArticles';
import { tagsToFileMeta } from './getFileTags';
import { computeStats } from './computeStats';

export const registerStatsCommand = (program: Command<[], {}>) =>
  program
    .command('stats')
    .description(cliText.statsCommandDescription)
    .option(
      '-r, --repository <path>',
      cliText.repositoryOptionDescription,
      resolveRepositoryPath,
      process.cwd(),
    )
    .option(
      '-h, --html <path>',
      cliText.htmlOptionDescription,
      resolve,
      './stats.html',
    )
    .option('--no-auto-open', cliText.noAutoOpenOptionDescription)
    .option('--precise-stats', cliText.preciseStatsOptionDescription, false)
    .option(
      '-j, --json <path>',
      cliText.jsonOptionDescription,
      resolve,
      './stats.json',
    )
    .option('--no-pull', cliText.noPullOptionDescription)
    .action(generateStatsPage);

type GenerateStatsProps = {
  readonly repository: string;
  readonly html: string;
  readonly autoOpen: boolean;
  readonly json: string;
  readonly pull: boolean;
  readonly preciseStats: boolean;
};

export async function generateStatsPage({
  repository,
  html,
  autoOpen,
  json,
  pull,
  preciseStats,
}: GenerateStatsProps): Promise<void> {
  const { git, tags } = await initializeCommand(repository, pull);

  const filesWithTags = await tagsToFileMeta(tags, git);
  const { processFile, computeFinal } = computeStats(
    tags.length > 0,
    preciseStats,
    Object.keys(filesWithTags).length,
  );
  await gatherArticles(repository, filesWithTags, processFile);
  console.log(cliText.finalizingOutput);

  const jsonString = JSON.stringify(computeFinal());
  if (typeof json === 'string') await fs.writeFile(json, jsonString);

  if (typeof html === 'string') {
    const webBundleLocation = 'web.bundle.js';
    const webBundleUrl = distPath(webBundleLocation);
    await fs.writeFile(
      html,
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <script>window.textHoarderStats = ${jsonString};</script>
    ${
      process.env.NODE_ENV === 'production'
        ? `<script>${await fs.readFile(webBundleUrl, 'utf8')}</script>`
        : `<script src="${relative(process.cwd(), webBundleUrl)}"></script>`
    }
  </body>
</html>`,
    );
    if (autoOpen) await open(html);
  }
}
