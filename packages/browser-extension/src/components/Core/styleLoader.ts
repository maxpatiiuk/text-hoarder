const styleTags: HTMLLinkElement[] = [];
export const getStyleTags = () => styleTags.map((node) => node.cloneNode(true));

export default (linkTag: HTMLLinkElement): void => void styleTags.push(linkTag);
