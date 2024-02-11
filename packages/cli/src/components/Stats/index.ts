import fs from 'node:fs/promises';
import open from 'open';
import path from 'node:path';

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
    .option('--precise-stats', cliText.preciseStatsOptionDescription, false)
    .option(
      '--json <path>',
      cliText.jsonOptionDescription,
      resolve,
      './stats.json',
    )
    .option('--no-pull', cliText.noPullOptionDescription)
    .action(generateStatsPage);

type GenerateStatsProps = {
  readonly cwd: string;
  readonly html: string;
  readonly autoOpen: boolean;
  readonly json: string;
  readonly pull: boolean;
  readonly preciseStats: boolean;
};

export async function generateStatsPage({
  cwd,
  html,
  autoOpen,
  json,
  pull,
  preciseStats,
}: GenerateStatsProps): Promise<void> {
  const { git, tags } = await initializeCommand(cwd, pull);

  const filesWithTags = await tagsToFileMeta(tags, git);
  const { processFile, computeFinal } = computeStats(
    tags.length > 0,
    preciseStats,
    Object.keys(filesWithTags).length,
  );
  await gatherArticles(cwd, filesWithTags, processFile);
  console.log(cliText.finalizingOutput);

  const jsonString = JSON.stringify(computeFinal());
  if (typeof json === 'string') await fs.writeFile(json, jsonString);

  if (typeof html === 'string') {
    const meta = import.meta.url;
    const webBundleLocation = './dist/web.bundle.js';
    const webBundleUrl = new URL(
      path.join('../../../', webBundleLocation),
      meta,
    );
    await fs.writeFile(
      html,
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <script>window.stats = ${jsonString};</script>
    ${
      process.env.NODE_ENV === 'production'
        ? `<script>${await fs.readFile(webBundleUrl).toString()}</script>`
        : `<script src="${webBundleLocation}"></script>`
    }
  </body>
</html>`,
    );
    if (autoOpen) await open(html);
  }
}
