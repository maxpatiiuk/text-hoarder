export const extensionContainerId = 'text-hoarder-container';
const stylesId = 'text-hoarder-styles';

/**
 * Unfortunately, modal dialog adding implicit "inert" to all background content
 * is not enough to remove the background content from Find in Page results.
 *
 * Hiding the background content, while not an ideal option*, fixes this.
 * *not ideal because:
 * - may break background content when it's displayed again in case it relies on
 *   computing styles using JavaScript
 * - may cause JavaScript errors if background content tries to re-compute
 *   position and sizing (i.e in response to scroll or timer)
 * - needless performance impact because of layout reflow
 */
const hideBackgroundContent = `body > *:not(#${extensionContainerId}) {
  visibility: hidden !important;
  opacity: 0 !important;
}`;

/**
 * If parent page has a scroll bar, temporary hide that
 */
const preventDuplicateScrollBar = `body {
  height: 100dvh !important;
  overflow-y: hidden !important;
}`;

export function applyHostPageStyles(): () => void {
  const style = document.createElement('style');
  style.id = stylesId;
  style.textContent = `
    ${preventDuplicateScrollBar} 
    ${hideBackgroundContent}
  `;
  document.head.append(style);
  return (): void => document.getElementById(stylesId)?.remove();
}
