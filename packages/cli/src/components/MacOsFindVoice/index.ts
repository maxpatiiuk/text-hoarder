import { exec } from 'node:child_process';
import { Command } from '@commander-js/extra-typings';
import { f } from '@common/utils/functools';
import { cliText } from '@common/localization/cliText';

const defaultDelay = 100;
const defaultSpeed = 100;

export const registerMacOsFindVoiceCommand = (program: Command<[], {}>) =>
  program
    .command('macos-find-voice')
    .description(cliText.macOsFindVoiceCommandDescription)
    .option(
      '-t, --text <string>',
      cliText.textOptionDescription,
      'Hi! This is a test voice.',
    )
    .option(
      '-l, --language <string>',
      cliText.languageOptionDescription,
      (value) => value.toLowerCase(),
    )
    .option(
      '-d, --delay <number>',
      cliText.delayOptionDescription,
      defaultDelay.toString(),
    )
    .option(
      '-s, --speed <number>',
      cliText.speedOptionDescription,
      defaultSpeed.toString(),
    )
    .option(
      '--voices <names...>',
      // Cellos, Organ, Good News   Samantha (Enhanced), Shelley (English (US))
      // FIXME: test voices with ( in names
      cliText.voicesOptionDescription,
    )
    .action(macOsFindVoice);

function macOsFindVoice({
  text,
  language,
  delay: rawDelay,
  speed: rawSpeed,
  voices = [],
}: {
  readonly text: string;
  readonly language?: string;
  readonly delay: string;
  readonly speed: string;
  readonly voices?: readonly string[];
}): void {
  const delay = f.parseInt(rawDelay) ?? defaultDelay;
  const speed = f.parseInt(rawSpeed) ?? defaultSpeed;

  exec('say -v "?"', (error, stdOut, stdError) => {
    if (error !== null) throw new Error(error.message);
    else if (stdError.length > 0) throw new Error(stdError);
    else
      sayVoices(
        filterVoices(parseVoices(stdOut), language, voices),
        text,
        delay,
        speed,
      ).catch(console.error);
  });
}

type Voices = readonly {
  readonly name: string;
  readonly language: string;
  readonly raw: string;
}[];

/**
 * Parse raw output from `say`.
 *
 * A single line looks like this:
 * Samantha (Enhanced) en_US    # Hello! My name is Samantha.
 */
const parseVoices = (stdOut: string): Voices =>
  stdOut
    .trim()
    .split('\n')
    .map((line) => {
      // This may break on macOS update
      const [nameAndLanguage, _description] = line.split('#');
      const parts = nameAndLanguage.trim().split(/\s+/u);
      return {
        name: parts.slice(0, -1).join(' '),
        language: parts.at(-1)!,
        raw: line,
      };
    });

/** Filter out voices as per CLI arguments */
const filterVoices = (
  voices: Voices,
  languageFilter: string | undefined,
  toInclude: readonly string[],
): Voices =>
  toInclude.length > 0
    ? voices.filter(({ name }) => toInclude.includes(name))
    : languageFilter === undefined
      ? voices
      : voices.filter(({ language }) =>
          language.toLowerCase().startsWith(languageFilter),
        );

async function sayVoices(
  voices: Voices,
  text: string,
  delay: number,
  speed: number,
): Promise<void> {
  voices.forEach(({ name }) => console.log(name));
  for (const { name, raw } of voices) {
    console.log(raw);
    await new Promise((resolve) =>
      exec(
        `say "${text.replaceAll('"', "'")}" --voice "${name}" --rate ${speed}`,
        (error, _stdout, stdErr) => {
          if (error !== null) throw new Error(error.message);
          if (stdErr) throw new Error(stdErr);
          resolve(undefined);
        },
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
