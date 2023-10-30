import { Octokit } from 'octokit';
import { encoding } from '../../utils/encoding';
import { gitHubAppName, gitHubAppId } from '../../../config';
import { http } from '../../utils/ajax';
import { Repository } from '../../utils/storage';

export type OctokitWrapper = {
  readonly owner: string;
  readonly repo: string;
  readonly hasFile: (name: string) => Promise<boolean>;
  readonly editFile: (
    name: string,
    commitMessage: string,
    content: string,
  ) => Promise<boolean>;
};

export function wrapOctokit(
  octokit: Octokit,
  { owner, name: repo }: Repository,
): OctokitWrapper {
  return {
    owner,
    repo,
    // FEATURE: cache the results of this function? and update cache on editFile
    hasFile: (fileName) =>
      octokit.rest.repos
        .getContent({
          owner,
          repo,
          path: encoding.fileName.encode(fileName),
          method: 'HEAD',
        })
        .then(
          ({ status }) =>
            status === http.noContent ||
            status === http.ok ||
            status === http.notModified,
        )
        .catch(() => false),
    // FIXME: if overriding, must specify SHA
    editFile: (name, commitMessage, content) =>
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
        })
        .then(({ status }) => status === http.created),
  };
}
