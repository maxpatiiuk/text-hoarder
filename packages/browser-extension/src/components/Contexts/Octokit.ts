import { Octokit } from 'octokit';
import { encoding } from '../../utils/encoding';
import { gitHubAppName, gitHubAppId } from '../../../config';

export type OctokitWrapper = {
  readonly owner: string;
  readonly repo: string;
  readonly getFile: (name: string) => Promise<string | undefined>;
  readonly editFile: (
    name: string,
    commitMessage: string,
    content: string,
  ) => Promise<boolean>;
};

export function wrapOctokit(
  octokit: Octokit,
  repositoryName: string,
): OctokitWrapper {
  const [owner, repo] = repositoryName.split('/');
  return {
    owner,
    repo,
    getFile: (fileName) =>
      octokit.rest.repos
        .getContent({
          owner,
          repo,
          path: encoding.fileName.encode(fileName),
        })
        .then((response) =>
          response.status === 200 &&
          'type' in response.data &&
          response.data.type === 'file'
            ? encoding.fileContent.decode(response.data.content)
            : undefined,
        )
        .catch(() => undefined),
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
        .then(({ status }) => status === 201),
  };
}
