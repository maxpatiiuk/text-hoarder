import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { AuthPrompt } from './AuthPrompt';
import { RepositoryList } from './RepositoryList';
import { signInText } from '../../../../common/src/localization/signInText';

const readmeFile = 'README.md';

export function EnsureAuthenticated({
  children,
}: {
  readonly children: JSX.Element;
}): JSX.Element {
  const { octokit, github } = React.useContext(AuthContext);
  const needsToSignIn = octokit === undefined;
  const needsToSetupRepository = github === undefined;

  const [needsReadme, setNeedsReadme] = React.useState(needsToSetupRepository);
  React.useEffect(
    () =>
      needsReadme
        ? void github
            ?.createFile(
              readmeFile,
              signInText.initializeExtension,
              signInText.readmeContent,
            )
            .catch(console.error)
            .finally(() => setNeedsReadme(false))
        : undefined,
    [needsReadme, github],
  );

  return needsToSignIn ? (
    <AuthPrompt />
  ) : needsToSetupRepository ? (
    <RepositoryList />
  ) : (
    children
  );
}
