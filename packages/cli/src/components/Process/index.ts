import { cliText } from '@common/localization/cliText';
import { Command, Option } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from '../Cli/util';
import { initializeCommand } from '../Cli/initializeCommand';
import { getUniqueName } from '@common/utils/uniquifyName';
import { tagsToFileMeta } from '../Stats/getFileTags';
import { encoding } from '@common/utils/encoding';
import { RA } from '@common/utils/types';
import { join, resolve } from 'node:path';
import { resolveExcludes, runGlob } from '../Spam';
import { formatNumber } from '@common/components/Atoms/Internationalization';
import { f } from '@common/utils/functools';
import { reshapeText } from './reshaper';
import { textProcessor } from './processor';

const today = new Date();
const todaysTag = encoding.date.encode(today);
const defaultSplit = 32_000;

export const registerProcessCommand = (program: Command<[], {}>) =>
  program
    .command('process')
    .description(cliText.processCommandDescription)
    .option(
      '-r, --repository <path>',
      cliText.repositoryOptionDescription,
      resolveRepositoryPath,
      process.cwd(),
    )
    .addOption(
      new Option(
        '--since-tag <string>',
        cliText.sinceTagOptionDescription,
        /*
         * Using null instead of undefined because commander.js does not
         * display default value when default is undefined
         */
      ).default(null, cliText.sinceTagOptionDefaultDescription),
    )
    .option('--no-since-tag', cliText.noSinceTagOptionDescription)
    .option('--till-tag <string>', cliText.tillTagOptionDescription)
    .option(
      '-c, --create-tag <string>',
      cliText.createTagOptionDescription,
      todaysTag,
    )
    .option('--no-create-tag', cliText.noCreateTagOptionDescription)
    .option(
      '--force-create-tag',
      cliText.forceCreateTagOptionDescription,
      false,
    )
    .option('--no-pull', cliText.noPullOptionDescription)
    .option('--glob <glob...>', cliText.optionalGlobOptionDescription)
    .option(
      '-o, --output-dir <path>',
      cliText.outputDirOptionDescription,
      `./processed/${todaysTag}`,
    )
    .option(
      '-f, --force-output-dir',
      cliText.forceOutputDirOptionDescription,
      false,
    )
    .addOption(
      new Option(
        '-s, --split <number>',
        cliText.splitOptionDescription,
      ).default(defaultSplit.toString(), formatNumber(defaultSplit)),
    )
    .option(
      '--no-exclude-duplicated-lines',
      cliText.noExcludeDuplicatedLinesOptionDescription,
    )
    .option('--no-default-exclude', cliText.noDefaultExcludeOptionDescription)
    .option(
      '--exclude-list <string>',
      cliText.excludeListOptionDescription,
      (path) => resolve(path),
    )
    .action(processArticles);

type ProcessProps = {
  readonly repository: string;
  readonly glob?: RA<string>;
  readonly outputDir: string;
  readonly forceOutputDir: boolean;
  readonly pull: boolean;
  readonly sinceTag?: string | null | false;
  readonly tillTag?: string;
  readonly noCreateTag?: boolean;
  readonly createTag: string | false;
  readonly forceCreateTag: boolean;
  readonly defaultExclude: boolean;
  readonly excludeList?: string | undefined;
  readonly excludeDuplicatedLines: boolean;
  readonly split: string;
};

export async function processArticles({
  repository,
  glob,
  outputDir: rawOutputDir,
  forceOutputDir,
  pull,
  sinceTag: rawSinceTag,
  tillTag: rawTillTag,
  noCreateTag,
  createTag,
  forceCreateTag,
  defaultExclude,
  excludeList,
  excludeDuplicatedLines,
  split: rawSplit,
}: ProcessProps): Promise<void> {
  const exclude = resolveExcludes(excludeList, process.cwd(), defaultExclude);
  const split = f.parseInt(rawSplit) ?? defaultSplit;
  const reshaper = reshapeText(exclude, excludeDuplicatedLines);

  const outputDir = resolve(repository, rawOutputDir);

  if (Array.isArray(glob) && glob.length > 0) {
    if (rawSinceTag !== null) console.warn(cliText.ignoringSinceTag);
    if (rawTillTag !== undefined) console.warn(cliText.ignoringTillTag);
    if (createTag !== false && createTag !== todaysTag)
      console.warn(cliText.ignoringCreateTag);
    if (forceCreateTag) console.warn(cliText.ignoringForceCreateTag);

    const globInstance = runGlob(glob, process.cwd());

    const { file, complete } = textProcessor(
      process.cwd(),
      outputDir,
      forceOutputDir,
      split,
      reshaper,
    );
    for (const path of globInstance) file(path);
    complete();

    return;
  }

  const { git, tags } = await initializeCommand(repository, pull);

  function validateTag(tag: string | undefined): void {
    if (typeof tag === 'string' && !tags.includes(tag)) {
      console.error(cliText.unknownTag(tag, tags));
      process.exit(1);
    }
  }
  validateTag(rawSinceTag === false ? undefined : rawSinceTag ?? undefined);
  validateTag(rawTillTag);

  const newTag =
    createTag === false
      ? undefined
      : typeof createTag === 'string'
        ? createTag
        : getUniqueName(todaysTag, tags, undefined, 'name');

  const resolvedSinceTag =
    rawSinceTag === false
      ? undefined
      : rawSinceTag ?? (tags.at(-1) === todaysTag ? tags.at(-2) : tags.at(-1));

  const [sinceTag, tillTag] =
    typeof rawTillTag === 'string' &&
    typeof resolvedSinceTag === 'string' &&
    tags.indexOf(resolvedSinceTag) > tags.indexOf(rawTillTag)
      ? [rawTillTag, resolvedSinceTag]
      : [resolvedSinceTag, rawTillTag];

  const shouldCreateTag =
    !noCreateTag &&
    typeof newTag === 'string' &&
    (rawSinceTag === false || rawSinceTag === null) &&
    tillTag === undefined;
  if (!shouldCreateTag && typeof createTag === 'string')
    console.warn(cliText.ignoringCreateTagAlt);

  const unbounded = sinceTag === undefined && tillTag === undefined;
  const includedTags = new Set(
    unbounded
      ? tags
      : sinceTag === undefined
        ? tags.slice(0, tags.indexOf(tillTag!))
        : tillTag === undefined
          ? tags.slice(tags.indexOf(sinceTag) + 1)
          : tags.slice(tags.indexOf(sinceTag) + 1, tags.indexOf(tillTag)),
  );

  const allFiles = await tagsToFileMeta(tags, git);
  const includeUntagged = unbounded || tags.at(-1) === sinceTag;
  const files = Object.entries(allFiles).filter(([, { tag }]) =>
    tag === undefined ? includeUntagged : includedTags.has(tag),
  );

  if (shouldCreateTag && tags.includes(newTag) && !forceCreateTag) {
    console.error(cliText.duplicateTag(newTag));
    process.exit(1);
  }

  if (includedTags.size > 0)
    console.log(cliText.processingFromTags(Array.from(includedTags)));

  const { file, complete } = textProcessor(
    repository,
    outputDir,
    forceOutputDir,
    split,
    reshaper,
  );
  for (const [path, { date }] of files) file(join(repository, path), date);
  complete();

  if (shouldCreateTag) {
    await git.tag([
      ...(forceCreateTag && tags.includes(newTag) ? ['-f'] : []),
      '-a',
      newTag,
      '-m',
      newTag,
    ]);
    await git.pushTags().catch((error) => {
      const message =
        error instanceof Error ? error.message : error?.toString() ?? '';
      console.error(cliText.tagPushError(message));
    });
  }
}
