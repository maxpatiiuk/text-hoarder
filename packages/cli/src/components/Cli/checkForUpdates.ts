/**
 * I tried update-notifier, but it's quite bundle-heavy and produces a lot
 * of warnings in Webpack (because some of it's dependencies are using dynamic
 * imports in a way that Webpack can't safely bundle into a single file).
 *
 * I also tried "npm view text-hoarder version", but running it is actually
 * slower than making this network request)
 */
import packageJson from '../../../npm/package.json';

const currentVersion = packageJson.version;

export const versionCheck = fetch(
  `https://registry.npmjs.org/${packageJson.name}/latest`,
)
  .then((response) => response.json())
  .then((response) => {
    const latestVersion = response.version;
    if (latestVersion !== currentVersion)
      console.warn(
        `🟥 Your version of ${packageJson.name} (${currentVersion}) does not match the latest version (${latestVersion}). Please update using "npm install ${packageJson.name}@latest" to avoid potential issues. 🟥`,
      );
  })
  .catch(() => {
    /** ignore */
  });
