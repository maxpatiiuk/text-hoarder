export function applyHardcodedBehavior(documentClone: Document): void {
  const hostname = new URL(documentClone.URL).hostname;
  if (hostname !== 'lesswrong.com' && !hostname.endsWith('.lesswrong.com')) return;

  // https://github.com/mozilla/readability/issues/1037
  documentClone
    .querySelectorAll(
      '.PostsPage-commentsSection, .PostsPage-betweenPostAndComments',
    )
    .forEach((node) => node.remove());
}