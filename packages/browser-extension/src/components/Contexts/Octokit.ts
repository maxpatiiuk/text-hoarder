import { Octokit } from 'octokit';
import { encoding } from '@common/utils/encoding';
import { gitHubAppName, gitHubAppId } from '../../../config';
import { http } from '@common/utils/ajax';
import { Repository } from '../../utils/storage';
import { State } from 'typesafe-reducer';
import { f } from '@common/utils/functools';

export type OctokitWrapper = {
  readonly owner: string;
  readonly repo: string;
  readonly hasFile: (name: string) => Promise<boolean>;
  readonly createFile: (
    name: string,
    commitMessage: string,
    content: string,
  ) => Promise<
    State<'AlreadyExists'> | State<'Created', { readonly sha: string }>
  >;
  readonly deleteFile: (name: string, commitMessage: string) => Promise<void>;
  readonly deleteFileUsingForcePush: (name: string) => Promise<boolean>;
};

export function wrapOctokit(
  octokit: Octokit,
  { owner, name: repo, branch }: Repository,
): OctokitWrapper {
  const fetchFileSha = (fileName: string): Promise<string | undefined> =>
    octokit.rest.repos
      .getContent({
        owner,
        repo,
        path: encoding.fileName.encode(fileName),
        branch,
      })
      .then(({ data }) =>
        'type' in data && data.type === 'file' ? data.sha : undefined,
      )
      .catch(() => undefined);

  const fetchBranchSha = (): Promise<string | undefined> =>
    octokit.rest.git
      .getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
      })
      .then(({ data }) => data.object.sha)
      .catch(() => undefined);

  return {
    owner,
    repo,
    hasFile: (fileName) =>
      octokit.rest.repos
        .getContent({
          owner,
          repo,
          path: encoding.fileName.encode(fileName),
          branch,
          method: 'HEAD',
        })
        .then(
          ({ status }) =>
            status === http.noContent ||
            status === http.ok ||
            status === http.notModified,
        )
        .catch(() => false),
    createFile: (name, commitMessage, content) =>
      octokit.rest.repos
        .createOrUpdateFileContents({
          owner,
          repo,
          path: encoding.fileName.encode(name),
          message: commitMessage,
          content: encoding.fileContent.encode(content),
          author: {
            name: `${gitHubAppName}[bot]`,
            email: `${gitHubAppId}+${gitHubAppName}[bot]@users.noreply.github.com`,
          },
          branch,
        })
        .then(({ data }) => ({
          type: 'Created' as const,
          sha: data.commit.sha!,
        }))
        .catch((response: Error) => {
          /*
           * If trying to edit existing file, sha is required.
           * Assuming that most of the time the file doesn't already exist,
           * it's cheaper to handle the error case than check existence
           * beforehand
           */
          if (
            'status' in response &&
            response.status === http.unprocessableContent &&
            response.message.includes('sha')
          )
            return { type: 'AlreadyExists' };
          throw response;
        }),
    deleteFile: (name, commitMessage) =>
      fetchFileSha(name)
        .then((sha) =>
          sha === undefined
            ? undefined
            : octokit.rest.repos.deleteFile({
                owner,
                repo,
                path: encoding.fileName.encode(name),
                message: commitMessage,
                author: {
                  name: `${gitHubAppName}[bot]`,
                  email: `${gitHubAppId}+${gitHubAppName}[bot]@users.noreply.github.com`,
                },
                branch,
                sha,
              }),
        )
        .then(() => undefined),
    async deleteFileUsingForcePush(name) {
      const {
        sha,
        commitData: { data },
      } = await f.all({
        sha: fetchBranchSha(),
        commitData: octokit.rest.repos.listCommits({
          owner,
          repo,
          branch,
          path: encoding.fileName.encode(name),
          per_page: 1,
        }),
      });

      if (sha === undefined) return false;
      const lastSha = data[0]?.sha;
      const parents = data[0]?.parents;
      const isChildOfMergeCommit = parents.length > 1;
      // Making sure there have been no other commits in the meanwhile
      const hadOtherPushes = lastSha !== sha;
      if (isChildOfMergeCommit || hadOtherPushes) return false;
      const parentSha = parents[0].sha;
      if (parentSha === undefined) return false;
      await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: parentSha,
        force: true,
      });
      return true;
    },
  };
}
