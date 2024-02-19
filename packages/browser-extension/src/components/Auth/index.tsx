import React from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { AuthPrompt } from './AuthPrompt';
import { RepositoryList } from './RepositoryList';
import { commitText } from '@common/localization/commitText';
import { initialContent } from './initialContent';

export function EnsureAuthenticated({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const { octokit, github } = React.useContext(AuthContext);
  const needsToSignIn = octokit === undefined;
  const needsToSetupRepository = github === undefined;

  const [needsSetup, setNeedsSetup] = React.useState(needsToSetupRepository);
  /**
   * Have to be VERY careful with the logic below. Reasons:
   * 1. Repository might have existing content - either safely merge, or NOOP,
   *    but don't corrupt or delete
   * 2. Extension might be re-initialized several times, thus this code would
   *    be run on the same repository multiple times
   * 3. Extension might be updated and this logic might change, yet be run on a
   *    repository initialized with an older version of the extension
   */
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
                : /*
                   * Persevere existing content if it's more than 3 lines
                   * (i.e not default GitHub repo content). It might also be a
                   * README that Text Hoarder previously created
                   */
                  file.content.trim().split('\n').length > 2
                  ? undefined
                  : github.updateFile(
                      initialContent.readme.name,
                      commitText.initialize,
                      initialContent.readme.content(github.owner, github.repo),
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
            .then((file) => {
              if (file === undefined)
                return github
                  .createFile(
                    initialContent.gitIgnore.name,
                    commitText.createFile(initialContent.gitIgnore.name),
                    initialContent.gitIgnore.content,
                  )
                  .then(() => undefined);
              const merged = mergeGitIgnore(
                file.content,
                initialContent.gitIgnore.content,
              );
              return merged === undefined
                ? undefined
                : github.updateFile(
                    initialContent.gitIgnore.name,
                    commitText.createFile(initialContent.gitIgnore.name),
                    merged,
                    file.sha,
                  );
            })
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

function mergeGitIgnore(current: string, add: string): string | undefined {
  const newLines = new Set(add.split('\n'));
  current
    .split('\n')
    .forEach((line) =>
      newLines.has(line) ? newLines.delete(line) : undefined,
    );
  return newLines.size === 0
    ? undefined
    : `${current}\n\n${Array.from(newLines).join('\n')}`;
}
