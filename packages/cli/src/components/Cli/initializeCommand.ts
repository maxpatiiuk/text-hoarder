import { cliText } from '@common/localization/cliText';
import { RA } from '@common/utils/types';
import simpleGit, { SimpleGit } from 'simple-git';

export async function initializeCommand(
  cwd: string,
  pull: boolean,
): Promise<{
  readonly git: SimpleGit;
  readonly tags: RA<string>;
}> {
  const git = simpleGit({ baseDir: cwd });

  const { installed } = await git.version();
  if (!installed) {
    console.error(cliText.gitNotInstalled);
    process.exit(1);
  }

  if (pull)
    await git.pull().catch((error) => {
      // May fail if no upstream is setup, or working tree is dirty
      console.error(error.message);
      return git.fetch();
    });
  else await git.fetch();

  const { all: tags } = await git.tags({
    '--merged': 'HEAD',
    '--sort': 'creatorDate'.toLowerCase(),
  });

  return { git, tags };
}
