import { listen } from '@common/utils/events';

/**
 * Listen to clicks on anchor elements, and scroll to the target element.
 */
export function listenToAnchors(container: HTMLElement): () => void {
  function handleClick(event: MouseEvent): void {
    if (
      event.target === null ||
      !('tagName' in event.target) ||
      event.target.tagName !== 'A'
    )
      return;
    const hash = 'hash' in event.target ? event.target.hash : '';
    const targetId = typeof hash === 'string' ? hash.slice(1) : '';
    if (targetId.length === 0) return;

    const shadowRoot = container.getRootNode() as ShadowRoot;
    const target = shadowRoot.getElementById(targetId);
    // Not using smooth to match browser behavior
    target?.scrollIntoView({ block: 'start' });
    console.log(target);
  }

  return listen(container, 'click', handleClick, {
    passive: true,
    capture: true,
  });
}
