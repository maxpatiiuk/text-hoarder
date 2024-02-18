import { commonText } from '@common/localization/commonText';
import { existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveRepositoryPath(rawPath: string): string {
  const resolved = resolve(rawPath);

  // User might have passed a subdirectory path - resolve root from it
  const gitDirectoryPath = findPath(resolved, '.git');
  if (gitDirectoryPath === undefined)
    throw new Error(
      `Could not find a ${commonText.textHoarder} repository at ${resolved}. If this is a new repository, please make sure to save at least one article before running this command`,
    );
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

const thisDirectory = dirname(import.meta.url);
/** Build a path to a file in packages/cli/dist/ */
export const distPath = (path: string): string =>
  fileURLToPath(join(thisDirectory, '../../../dist/', path));
