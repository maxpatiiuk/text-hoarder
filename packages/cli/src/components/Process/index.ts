import { cliText } from '@common/localization/cliText';
import { Command, Option } from '@commander-js/extra-typings';
import { resolveRepositoryPath } from '../Cli/util';
import { initializeCommand } from '../Cli/initializeCommand';
import { getUniqueName } from '@common/utils/uniquifyName';
import { FilesWithTags, tagsToFileMeta } from '../Stats/getFileTags';
import { encoding } from '@common/utils/encoding';
import { RA } from '@common/utils/types';

const today = new Date();
const todaysTag = encoding.date.encode(today);

export const registerProcessCommand = (program: Command<[], {}>) =>
  program
    .command('process')
    .description(cliText.processCommandDescription)
    .option(
      '--cwd <path>',
      cliText.cwdOptionDescription,
      resolveRepositoryPath,
      process.cwd(),
    )
    .addOption(
      new Option(
        '--since-tag <string>',
        cliText.sinceTagOptionDescription,
      ).default(undefined, cliText.sinceTagOptionDefaultDescription),
    )
    .option('--till-tag <string>', cliText.tillTagOptionDescription)
    .option(
      '--create-tag <string>',
      cliText.createTagOptionDescription,
      todaysTag,
    )
    .option('--no-create-tag', cliText.noCreateTagOptionDescription)
    .option('--force-create-tag', cliText.forceCreateTagOptionDescription, true)
    .option('--no-pull', cliText.noPullOptionDescription)
    .action((props) => {
      console.log(props);
      const files = processArticles(props);
      // FIXME: read and process file contents
      // FIXME: export files for 2023-11-18
      // FIXME: output the gathered files
    });

type ProcessProps = {
  readonly cwd: string;
  readonly pull: boolean;
  readonly sinceTag?: string | null;
  readonly tillTag?: string;
  readonly createTag: string | false | undefined;
  readonly forceCreateTag?: boolean;
};

export async function processArticles({
  cwd,
  pull,
  sinceTag: rawSinceFlag,
  tillTag: rawTillTag,
  createTag,
  forceCreateTag = true,
}: ProcessProps): Promise<RA<readonly [string, FilesWithTags[string]]>> {
  const { git, tags } = await initializeCommand(cwd, pull);

  function validateTag(tag: string | undefined): void {
    if (tag && !tags.includes(tag)) {
      console.error(
        `Tag ${tag} does not exist.${
          tags.length === 0 ? '' : ` Existing tags are: ${tags.join(', ')}`
        }`,
      );
      process.exit(1);
    }
  }
  validateTag(rawSinceFlag ?? undefined);
  validateTag(rawTillTag);

  const newTag =
    createTag === false
      ? undefined
      : typeof createTag === 'string'
        ? createTag
        : getUniqueName(todaysTag, tags);

  const resolvedSinceTag =
    rawSinceFlag === null
      ? undefined
      : rawSinceFlag ?? (tags.at(-1) === newTag ? tags.at(-2) : tags.at(-1));

  const [sinceTag, tillTag] =
    typeof rawTillTag === 'string' &&
    typeof resolvedSinceTag === 'string' &&
    tags.indexOf(resolvedSinceTag) > tags.indexOf(rawTillTag)
      ? [rawTillTag, resolvedSinceTag]
      : [resolvedSinceTag, rawTillTag];

  const shouldCreateTag =
    typeof newTag === 'string' &&
    sinceTag === undefined &&
    tillTag === undefined;
  if (!shouldCreateTag && typeof createTag === 'string')
    console.warn(
      'Ignoring --create-tag because --since-tag or --till-tag was specified',
    );

  const unbounded = sinceTag === undefined && tillTag === undefined;
  const includedTags = new Set(
    unbounded
      ? tags
      : sinceTag === undefined
        ? tags.slice(0, tags.indexOf(tillTag!))
        : tags.slice(tags.indexOf(sinceTag)),
  );

  const allFiles = await tagsToFileMeta(tags, git);
  const includeUntagged = unbounded || tags.at(-1) === sinceTag;
  const files = Object.entries(allFiles).filter(([, { tag }]) =>
    tag === undefined ? includeUntagged : includedTags.has(tag),
  );

  if (shouldCreateTag && tags.includes(newTag))
    if (forceCreateTag) await git.tag(['-d', newTag]);
    else {
      console.error(
        `Tag ${newTag} already exists. Use --force-create-tag to overwrite`,
      );
      process.exit(1);
    }

  return files;
}
