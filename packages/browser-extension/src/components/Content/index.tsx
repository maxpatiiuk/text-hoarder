import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { useStorage } from '../../hooks/useStorage';
import { gitHubAppId, gitHubAppName } from '../../../config';
import { textToBase64 } from '../../utils/gitHub';

// FEATURE: use signed commits https://github.com/orgs/community/discussions/50055
// FEATURE: create README.md if not already

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
        path: 'test2.txt',
        message: 'test a Ā 𐀀 文 🦄',
        content: textToBase64('test ç a Ā 𐀀 文 🦄'),
        author: {
          name: `${gitHubAppName}[bot]`,
          email: `${gitHubAppId}+${gitHubAppName}[bot]@users.noreply.github.com`,
        },
      }),
  );
  return <>Test</>;
}
