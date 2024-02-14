import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { AuthPrompt } from './AuthPrompt';
import { RepositoryList } from './RepositoryList';
import { commitText } from '@common/localization/commitText';
import { initialContent } from './initialContent';

// FIXME: check for cli updates and prompt user to update

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
              initialContent.readme.name,
              commitText.initialize,
              initialContent.readme.content(github.owner, github.repo),
            )
            // Will error if file already exists
            .catch(console.log)
            .then(() =>
              github.createFile(
                initialContent.packageJson.name,
                commitText.createFile(initialContent.packageJson.name),
                initialContent.packageJson.content(github.owner),
              ),
            )
            .catch(console.log)
            .then(() =>
              github.createFile(
                initialContent.gitIgnore.name,
                commitText.createFile(initialContent.gitIgnore.name),
                initialContent.gitIgnore.content,
              ),
            )
            .catch(console.log)
            .then(() =>
              github.createFile(
                initialContent.excludeList.name,
                commitText.createFile(initialContent.excludeList.name),
                initialContent.excludeList.content,
              ),
            )
            .catch(console.log)
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
