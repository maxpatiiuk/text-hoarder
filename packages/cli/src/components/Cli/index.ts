#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings';
import { registerStatsCommand } from '../Stats';
import { cliText } from '@common/localization/cliText';
import { registerProcessCommand } from '../Process';
import { registerFindSpamCommand } from '../Spam';

const program = new Command();

program
  .name(cliText.textHoarderCli)
  .version(process.env.TEXT_HOARDER_VERSION ?? '')
  .description(cliText.commandDescription)
  .showHelpAfterError();

registerStatsCommand(program);
registerProcessCommand(program);
registerFindSpamCommand(program);

program.parse(process.argv);
