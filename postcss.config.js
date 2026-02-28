// See https://postcss.org/docs/postcss-plugin-guidelines for plugin writing
import tailwindcss from '@tailwindcss/postcss';

/**
 * Modify the .css file from the github-markdown-css library to have
 * dark/light mode be determined by a class name, not media query.
 *
 * See my solution posted in
 * https://github.com/sindresorhus/github-markdown-css/issues/104#issuecomment-1774279738
 */
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
 * When in content script, despite having my react tree inside of shadow DOM,
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
// Regex to find all occurrences of "rem" units
const remRegex = /(?<=\d)rem/g;

const convertRemToEm = {
  postcssPlugin: 'convertRemToEm',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  Declaration(declaration) {
    declaration.value = declaration.value.replaceAll(remRegex, 'em');
  },
};

/**
 * Fix Tailwind's preflight applying styles only to "html" selector, and not
 * ":host", thus not working inside of shadow DOM (since my <style> block
 * is added only inside the shadow DOM, "html" selector never matches)
 */
const useHostAlongsideHtml = {
  postcssPlugin: 'useHostAlongsideHtml',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  Rule(rule) {
    if (rule.selector === 'html') rule.selector = 'html, :host';
  },
};

/**
 * Prevent Tailwind preflight from overriding browser's default list-style (as
 * GitHub styles do not override it either but rely on the user agent
 * stylesheet)
 */
const dontOverwriteListStyle = {
  postcssPlugin: 'dontOverwriteListStyle',
  // When debugging this, https://astexplorer.net/#/2uBU1BLuJ1 is very helpful
  Declaration(declaration) {
    if (declaration.prop === 'list-style' && declaration.value === 'none')
      declaration.remove();
  },
};

export default {
  plugins: [
    // Tailwind v4 handles @import resolution and autoprefixing natively
    tailwindcss,
    makeGitHubCssUseClassName,
    useHostAlongsideHtml,
    convertRemToEm,
    dontOverwriteListStyle,
  ],
};
