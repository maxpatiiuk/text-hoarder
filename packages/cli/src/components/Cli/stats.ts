import { simpleGit } from 'simple-git';
import { metaFileName, readMetaFile } from './meta';
import { commitText } from '@common/localization/commitText';

export async function computeStats({
  cwd,
  html,
  autoOpen,
  json,
  pull,
}: {
  readonly cwd: string;
  readonly html: string;
  readonly autoOpen: boolean;
  readonly json: string;
  readonly pull: boolean;
}): Promise<void> {
  const git = simpleGit({ baseDir: cwd });
  const metaFile = readMetaFile(cwd);

  if (pull) await git.pull();
  else await git.fetch();

  console.log({
    metaFile,
    cwd,
    html,
    autoOpen,
    json,
    pull,
  });

  git.commit(commitText.updateMetadata, [metaFileName]);
  // git.status
  // git .stash
  // await simpleGit().log('0.11.0', '0.12.0')
  //  .commit('committed as "Another Person"', 'file-two', {
  // '--author': '"Another Person <another@person.com>"',
  // });
}
