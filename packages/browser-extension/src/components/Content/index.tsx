import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { useStorage } from '../../hooks/useStorage';
import { gitHubAppId, gitHubAppName } from '../../../config';
import { encoding } from '../../utils/encoding';

// FEATURE: use signed commits https://github.com/orgs/community/discussions/50055
// FEATURE: create README.md if not already
// FEATURE: when adding new entry, check if the same URL was already added in the last 2 years

export function MainScreen(): JSX.Element {
  const [repositoryOwner, repositoryName] =
    useStorage('repositoryName')[0]!.split('/');
  const auth = React.useContext(AuthContext);
  console.log(
    auth,
    () =>
      auth?.octokit?.rest.repos.createOrUpdateFileContents({
        owner: repositoryOwner,
        repo: repositoryName,
        path: encoding.fileName.encode('test2.txt'),
        message: 'test a Ā 𐀀 文 🦄',
        content: encoding.fileContent.encode('test ç a Ā 𐀀 文 🦄'),
        author: {
          name: `${gitHubAppName}[bot]`,
          email: `${gitHubAppId}+${gitHubAppName}[bot]@users.noreply.github.com`,
        },
      }),
  );
  return <>Test</>;
}
