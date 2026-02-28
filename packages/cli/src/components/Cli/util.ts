import { cliText } from '@common/localization/cliText';
import { existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveRepositoryPath(rawPath: string): string {
  const resolved = resolve(rawPath);

  // User might have passed a subdirectory path - resolve root from it
  const gitDirectoryPath = findPath(resolved, '.git');
  if (gitDirectoryPath === undefined)
    throw new Error(cliText.repositoryPathResolveError(resolved));
  return dirname(gitDirectoryPath);
}
/**
 * Climb the directory tree upward, until found a directory that contains the
 * target file, and return resulting full path
 */
export function findPath(
  startDirectory: string,
  target: string,
): string | undefined {
  const parentPath = startDirectory.split(sep);
  while (parentPath.length > 2) {
    const fullPath = join(sep, ...parentPath, target);
    if (existsSync(fullPath)) return fullPath;

    parentPath.pop();
  }
  return undefined;
}

// At runtime this resolves to the directory containing the bundle (dist/)
const thisDirectory = dirname(fileURLToPath(import.meta.url));
/** Build a path to a file in packages/cli/dist/ */
export const distPath = (path: string): string => join(thisDirectory, path);
