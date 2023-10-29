import { Octokit } from 'octokit';
import { encoding } from '../../utils/encoding';
import { gitHubAppName, gitHubAppId } from '../../../config';
import { Repository } from '../../hooks/useStorage';
import { http } from '../../utils/ajax';

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
    hasFile: (fileName) =>
      octokit
        .request('HEAD /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: encoding.fileName.encode(fileName),
        })
        .then(
          ({ status }) =>
            status === http.noContent ||
            status === http.ok ||
            status === http.notModified,
        )
        .catch(() => false),
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
