import { Octokit } from 'octokit';
import { encoding } from '../../utils/encoding';
import { gitHubAppName, gitHubAppId } from '../../../config';
import { http } from '../../utils/ajax';
import { Repository } from '../../utils/storage';
import { State } from 'typesafe-reducer';

export type OctokitWrapper = {
  readonly owner: string;
  readonly repo: string;
  readonly hasFile: (name: string) => Promise<boolean>;
  readonly fetchSha: (name: string) => Promise<string | undefined>;
  readonly createFile: (
    name: string,
    commitMessage: string,
    content: string,
  ) => Promise<
    State<'AlreadyExists'> | State<'Created', { readonly sha: string }>
  >;
  readonly deleteFile: (
    name: string,
    commitMessage: string,
    sha: string,
  ) => Promise<void>;
};

export function wrapOctokit(
  octokit: Octokit,
  { owner, name: repo, branch }: Repository,
): OctokitWrapper {
  return {
    owner,
    repo,
    fetchSha: (fileName) =>
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
        .catch(() => undefined),
    // FEATURE: cache the results of this function? and update cache on editFile
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
    deleteFile: (name, commitMessage, sha) =>
      octokit.rest.repos
        .deleteFile({
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
        })
        .then((response) => {
          console.log(response);
          return undefined;
        }),
  };
}
