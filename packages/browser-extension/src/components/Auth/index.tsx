import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { AuthPrompt } from './AuthPrompt';
import { RepositoryList } from './RepositoryList';
import { urls } from '../../../config';
import { commitText } from '@common/localization/commitText';

const readmeFile = 'README.md';

export function EnsureAuthenticated({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const { octokit, github } = React.useContext(AuthContext);
  const needsToSignIn = octokit === undefined;
  const needsToSetupRepository = github === undefined;

  const [needsSetup, setNeedsSetup] = React.useState(needsToSetupRepository);
  React.useEffect(
    () =>
      needsSetup
        ? void github
            ?.createFile(
              readmeFile,
              commitText.initialize,
              commitText.readmeContent(
                urls.webStoreUrl,
                urls.webStoreReviewUrl,
              ),
            )
            .catch(console.error)
            .finally(() => setNeedsSetup(false))
        : undefined,
    [needsSetup, github],
  );

  return needsToSignIn ? (
    <AuthPrompt />
  ) : needsToSetupRepository ? (
    <RepositoryList />
  ) : (
    <>{children}</>
  );
}
