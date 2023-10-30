// See https://postcss.org/docs/postcss-plugin-guidelines for plugin writing

/**
 * Modify the .css file from the github-markdown-css library to have
 * dark/light mode be determined by a class name, not media query.
 *
 * See my solution posted in
 * https://github.com/sindresorhus/github-markdown-css/issues/104#issuecomment-1774279738
 */
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

/**
 * When in content script, despite having my react tree inside of shadow rom,
 * host page's styles affect the size of "rem" unit.
 *
 * The workaround is:
 * - Convert all usages of "rem" to "em" in the CSS files
 * - In the Popup, where I know that "rem" is not affected by host page's
 *   styles, add "font-size: 1rem" to body element, thus making 1em = 1rem
 *
 * Benefits:
 * - Preserves the ability for user to modify font-size in the browser settings,
 *   and have that affect the font-size of the Popup
 * - Makes the content script protected against host page changing rem value
 */
/** @type {import('postcss-load-config').ConfigPlugin} */
const convertRemToEm = {
  postcssPlugin: 'convertRemToEm',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  Declaration(declaration) {
    declaration.value = declaration.value.replaceAll(remRegex, 'em');
  },
};

// Regex to find all occurrences of "rem" units
const remRegex = /(?<=\d)rem/g;

/**
 * Fix tailwind's preflight apply styles only to "html" selector, and not
 * ":host", thus not working inside of shadow dom (since my <styles> block
 * is added only inside the shadow dom, "html" selector never matches)
 */
/** @type {import('postcss-load-config').ConfigPlugin} */
const useHostAlongsideHtml = {
  postcssPlugin: 'useHostAlongsideHtml',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  Rule(rule) {
    if (rule.selector === 'html') rule.selector = 'html, :host';
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
    convertRemToEm,
    useHostAlongsideHtml,
  ],
};
