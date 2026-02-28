/**
 * Rather than appending styles directly to the page (as that would mess with
 * the host page's styles), collect CSS strings so they can later be manually
 * appended to Shadow DOM as <style> elements.
 */

const styles: string[] = [];

export const collectStyle = (css: string): void => void styles.push(css);

export const getStyleTags = (): HTMLStyleElement[] =>
  styles.map((css) => {
    const el = document.createElement('style');
    el.textContent = css;
    return el;
  });
