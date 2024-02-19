import { cliText } from '@common/localization/cliText';
import { Command } from '@commander-js/extra-typings';
import { savedFileExtension } from '@common/utils/encoding';
import type { R, RA } from '@common/utils/types';
import { Glob } from 'glob';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { initialContent } from '../../../../browser-extension/src/components/Auth/initialContent';
import { distPath, findPath } from '../Cli/util';
import { multiSortFunction } from '@common/utils/utils';
import { markdownToText } from '../../../../browser-extension/src/components/ExtractContent/markdownToText';
import { f } from '@common/utils/functools';

const defaultLimit = 100;

export const registerFindSpamCommand = (program: Command<[], {}>) =>
  program
    .command('find-spam')
    .description(cliText.findSpamCommandDescription)
    .argument('[glob...]', cliText.globOptionDescription, [
      `**/*${savedFileExtension}`,
    ])
    .option(
      '--cwd <string>',
      cliText.cwdOptionDescription,
      (path) => resolve(path),
      process.cwd(),
    )
    .option(
      '-l, --limit <number>',
      cliText.limitOptionDescription,
      defaultLimit.toString(),
    )
    .option('--no-default-exclude', cliText.noDefaultExcludeOptionDescription)
    .option('-c, --show-counts', cliText.showCountsOptionDescription, false)
    .option(
      '--exclude-list <string>',
      cliText.excludeListOptionDescription,
      (path) => resolve(path),
    )
    .action(findSpam);

function findSpam(
  glob: RA<string>,
  {
    cwd,
    defaultExclude,
    excludeList,
    limit: rawLimit,
    showCounts,
  }: {
    readonly cwd: string;
    readonly defaultExclude: boolean;
    readonly excludeList?: string;
    readonly limit: string;
    readonly showCounts: boolean;
  },
): void {
  const globInstance = runGlob(glob, cwd);
  const exclude = resolveExcludes(excludeList, cwd, defaultExclude);
  const lines: R<number> = {};
  for (const file of globInstance) {
    const content = fs.readFileSync(file, 'utf8');
    const text = file.endsWith(savedFileExtension)
      ? markdownToText(content)
      : content;
    text.split('\n').forEach((line) => {
      if (exclude.has(line) || line.trimStart().length === 0) return;
      lines[line] ??= 0;
      lines[line] += 1;
    });
  }

  const limit = f.parseInt(rawLimit) ?? defaultLimit;
  const results = Object.entries(lines)
    .filter(([, count]) => count > 1)
    .sort(
      multiSortFunction(
        ([, count]) => count,
        true,
        ([line]) => line,
      ),
    );
  const sliced = limit < 0 ? results : results.slice(0, limit);

  console.log(
    sliced
      .map(([line, count]) => (showCounts ? `${count}\t${line}` : line))
      .join('\n'),
  );
}

const isGlobby = '[*?('.split('');
export function runGlob(
  globs: RA<string>,
  cwd: string,
): Generator<string, void, void> {
  /*
   * Make globs more user-friendly by automatically searching for all text files
   * in a directory
   */
  const smartGlobs = globs.map((glob) =>
    isGlobby.some((character) => glob.includes(character)) ||
    (glob.endsWith('/') && glob.slice(1).includes('.'))
      ? glob
      : `${glob}${glob.endsWith('/') ? '' : '/'}**/*.{md,txt}`,
  );

  const generator = new Glob(smartGlobs, {
    cwd,
    nodir: true,
    absolute: true,
    distPath: true,
  });

  let matchedAny = false;
  for (const _ of generator) {
    matchedAny = true;
    break;
  }

  if (!matchedAny) console.warn(cliText.noGlobMatches);

  return generator.iterateSync();
}

export function resolveExcludes(
  excludeList: string | undefined,
  cwd: string,
  useDefaultExclude: boolean,
): ReadonlySet<string> {
  const excludeListPath = readExcludeList(
    excludeList ?? findPath(cwd, initialContent.excludeList.name),
  );
  const defaultExcludeList = useDefaultExclude
    ? readExcludeList(distPath(initialContent.excludeList.name))
    : [];
  return new Set([...excludeListPath, ...defaultExcludeList]);
}

const readExcludeList = (path: string | undefined): RA<string> =>
  typeof path === 'string' && fs.existsSync(path)
    ? fs
        .readFileSync(path, 'utf8')
        .split('\n')
        .filter((line) => !line.startsWith('#'))
    : [];
