import { resolve } from 'node:path';
import { Command } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from './util';
import { computeStats } from './stats';
import { commonText } from '@common/localization/commonText';
import { cliText } from '@common/localization/cliText';

const program = new Command();

program
  .name(commonText.textHoarder)
  .description(cliText.commandDescription)
  .showHelpAfterError();

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
  .action(computeStats);

program.parse(process.argv);
