const postcss = require('postcss');

/** @type {import('postcss-load-config').ConfigPlugin} */
const makeGitHubCssUseClassName = {
  postcssPlugin: 'makeGitHubCssUseClassName',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  AtRule: {
    media(media, { Rule }) {
      const filePath = media.root().source?.input?.file ?? '';
      if (!filePath.endsWith('/github-markdown.css')) return;

      const scopeSelector =
        media.params === '(prefers-color-scheme: dark)'
          ? '.dark'
          : media.params === '(prefers-color-scheme: light)'
          ? '.light'
          : undefined;
      if (scopeSelector === undefined) return;

      media.each((child) => {
        if (child.type !== 'rule') return;
        const newRule = new Rule({
          selector: `${scopeSelector} ${child.selector}`,
        });

        child.each((grandChild) => void newRule.append(grandChild.clone()));
        media.before(newRule);
      });
      media.remove();
    },
  },
};

/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: [
    'postcss-import',
    'postcss-preset-env',
    require('tailwindcss'),
    require('autoprefixer'),
    makeGitHubCssUseClassName,
  ],
};
