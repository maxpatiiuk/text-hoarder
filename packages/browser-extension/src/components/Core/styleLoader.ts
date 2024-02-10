/**
 * Rather than appending styles directly to the page (as that would mess with)
 * the host page's styles, append styles to an array, so that they can later be
 * manually appended to Shadow DOM
 */

const styleTags: HTMLLinkElement[] = [];
export const getStyleTags = () => styleTags.map((node) => node.cloneNode(true));

export default (linkTag: HTMLLinkElement): void => void styleTags.push(linkTag);
