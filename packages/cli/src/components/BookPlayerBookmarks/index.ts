import { cliText } from '@common/localization/cliText';
import { Command } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from '../Cli/util';
import { initializeCommand } from '../Cli/initializeCommand';
import { resolve } from 'node:path';
import { encoding } from '@common/utils/encoding';

const today = new Date();
const todaysTag = encoding.date.encode(today);

export const registerBookPlayerParseCommand = (program: Command<[], {}>) =>
  program
    .command('book-player-parse')
    .description(cliText.bookPlayerParseCommandDescription)
    .option(
      '-r, --repository <path>',
      cliText.repositoryOptionDescription,
      resolveRepositoryPath,
      process.cwd(),
    )
    .option('--json-output <string>', cliText.jsonOutputOptionDescription)
    .option(
      '--html-output <string>',
      cliText.htmlOutputOptionDescription,
      `./bookmarks_${todaysTag}.html`,
    )
    .option('--no-auto-open', cliText.noAutoOpenOptionDescription)
    .option('--no-pull', cliText.noPullOptionDescription)
    .option('-f, --force-output', cliText.forceOutputOptionDescription, false)
    .action(parseBookmarks);

type ProcessProps = {
  readonly repository: string;
  readonly forceOutput: boolean;
  readonly pull: boolean;
  readonly jsonOutput?: string;
  readonly htmlOutput: string;
  readonly autoOpen: boolean;
};

async function parseBookmarks({
  repository,
  forceOutput,
  pull,
  jsonOutput = '',
  htmlOutput,
  autoOpen,
}: ProcessProps): Promise<void> {
  const jsonLocation =
    jsonOutput === undefined ? undefined : resolve(repository, jsonOutput);
  const htmlLocation =
    htmlOutput === '' ? undefined : resolve(repository, htmlOutput);

  await initializeCommand(repository, pull);
}
