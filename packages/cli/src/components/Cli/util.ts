import { existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

export function resolveRepositoryPath(rawPath: string): string {
  const resolved = resolve(rawPath);

  // User might have passed a subdirectory path - resolve root from it
  const gitDirectoryPath = findPath(resolved, '.git');
  if (gitDirectoryPath === undefined)
    throw new Error(
      `Could not find a Text Hoarder repository at ${resolved}. If this is a new repository, please make sure to save at least one article before running this command`,
    );
  return dirname(gitDirectoryPath);
}

function findPath(startDirectory: string, target: string): string | undefined {
  const parentPath = startDirectory.split(sep);
  while (parentPath.length > 2) {
    const fullPath = join(sep, ...parentPath, target);
    if (existsSync(fullPath)) return fullPath;

    parentPath.pop();
  }
  return undefined;
}
