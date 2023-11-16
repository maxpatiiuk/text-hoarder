import fs from 'fs/promises';
import { RA, isDefined } from '@common/utils/types';
import simpleGit, { SimpleGit } from 'simple-git';
import { f } from '@common/utils/functools';

export async function initializeCommand(
  cwd: string,
  pull: boolean,
): Promise<{
  readonly git: SimpleGit;
  readonly years: RA<number>;
  readonly tags: RA<string>;
}> {
  const git = simpleGit({ baseDir: cwd });

  if (pull)
    await git.pull().catch((error) => {
      // May fail if no upstream is setup, or working tree is dirty
      console.error(error.message);
      return git.fetch();
    });
  else await git.fetch();

  const files = await fs.readdir(cwd);
  const years = files.map((file) => f.parseInt(file)).filter(isDefined);

  const { all: tags } = await git.tags({
    '--merged': 'HEAD',
    '--sort': 'creatordate',
  });

  return { git, years, tags };
}
