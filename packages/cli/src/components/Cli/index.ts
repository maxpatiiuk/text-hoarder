import { resolve } from 'node:path';
import { Command } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from './util';
import { computeStats } from './stats';

const program = new Command();

program.name('Text Hoarder').description(
  `A companion CLI app for the Text Hoarder browser extension. The browser
extension saves webpages to a GitHub repository. This CLI app then worked
with the local clone of the GitHub repository to provide insights into your
most commonly saved webpages. This CLI also has a convenience utility for
optimizing exported articles for text-to-speech`,
);

program.showHelpAfterError();

program
  .command('stats')
  .description('Generate statistics from saved articles')
  .option(
    '--cwd <path>',
    'The repository to run the command in. Defaults to current directory',
    resolveRepositoryPath,
    process.cwd(),
  )
  .option(
    '--html <path>',
    'The path at which an HTML file with computed stats would be emitted',
    resolve,
    './stats.html',
  )
  .option(
    '--no-auto-open',
    'Do not automatically open the generated HTML file in the browser',
  )
  .option(
    '--no-pull',
    'Do not automatically try to pull the latest changes from GitHub',
  )
  .option(
    '--json <path>',
    'The path at which a JSON file with computed stats would be emitted',
    resolve,
    './stats.json',
  )
  .action(computeStats);

program.parse(process.argv);
