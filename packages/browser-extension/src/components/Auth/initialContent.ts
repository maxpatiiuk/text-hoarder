import { commitText } from '@common/localization/commitText';
import { commonText } from '@common/localization/commonText';
import { urls } from '../../../config';

export const initialContent = {
  readme: {
    name: 'README.md',
    content: (owner: string, repo: string) =>
      commitText.readmeContent(owner, repo),
  },
  packageJson: {
    name: 'package.json',
    content: (name = 'text-hoarder-store') =>
      JSON.stringify(
        {
          name,
          description: commitText.textHoarderStoreDescription,
          private: true,
          type: 'module',
          dependencies: {
            'text-hoarder': 'latest',
          },
        },
        null,
        2,
      ),
  },
  gitIgnore: {
    name: '.gitignore',
    /*
     * While ignoring package-lock.json is usually not recommended, for
     * text-hoarder, the latest version of the CLI should be used at all times,
     * so package-lock.json is needless
     */
    content: `
node_modules
package-lock.json
# Will hold output from "npx text-hoarder process"
processed
`.trim(),
  },
  excludeList: {
    name: 'exclude-list.txt',
    content: `
# Add lines to this file to exclude them from the "npx text-hoarder process" command.
# For example, exclude lines like "Advertisement", "RECOMMENDED VIDEOS FOR YOU",
# and other unwanted content.
#
# Lines starting with "#" are comments and are ignored.
#
# This file is supplementing the default exclude list that comes with ${commonText.textHoarder}.
# See default exclude list - ${urls.excludeList}
# See CLI docs - ${urls.cliDocs}
`.trim(),
  },
};
