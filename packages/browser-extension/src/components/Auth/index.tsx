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
            ?.getFile(initialContent.readme.name)
            .then((file) =>
              file === undefined
                ? github
                    .createFile(
                      initialContent.readme.name,
                      commitText.initialize,
                      initialContent.readme.content(github.owner, github.repo),
                    )
                    .then(() => undefined)
                : github.updateFile(
                    initialContent.readme.name,
                    commitText.initialize,
                    `${
                      /*
                       * Persevere existing content if it's more than 2 lies
                       * (i.e not default GitHub repo content)
                       */
                      file.content.trim().split('\n').length > 1
                        ? `${file.content}\n\n`
                        : ''
                    }${initialContent.readme.content(
                      github.owner,
                      github.repo,
                    )}`,
                    file.sha,
                  ),
            )
            .catch(console.log)
            .then(() =>
              /*
               * Not merging with existing package.json but failing silently
               * because safely merging and with no needless whitespace changes
               * is tricky, and it's unlikely that the repository will already
               * contain package.json (ideally, it would be empty)
               */
              github.createFile(
                initialContent.packageJson.name,
                commitText.createFile(initialContent.packageJson.name),
                initialContent.packageJson.content(github.owner),
              ),
            )
            // Will error if file already exists
            .catch(console.log)
            .then(() => github.getFile(initialContent.gitIgnore.name))
            .then((file) =>
              file === undefined
                ? github
                    .createFile(
                      initialContent.gitIgnore.name,
                      commitText.createFile(initialContent.gitIgnore.name),
                      initialContent.gitIgnore.content,
                    )
                    .then(() => undefined)
                : github.updateFile(
                    initialContent.gitIgnore.name,
                    commitText.createFile(initialContent.gitIgnore.name),
                    mergeGitIgnore(
                      file.content,
                      initialContent.gitIgnore.content,
                    ),
                    file.sha,
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

function mergeGitIgnore(current: string, add: string): string {
  const newLines = new Set(add.split('\n'));
  current
    .split('\n')
    .forEach((line) =>
      newLines.has(line) ? newLines.delete(line) : undefined,
    );
  return `${current}\n\n${commitText.gitIgnoreComment}\n${Array.from(
    newLines,
  ).join('\n')}`;
}
