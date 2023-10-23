/**
 * This scrip is called by background scrip on keyboard shortcut press - it is
 * executed in the page that was active when action was triggered.
 */

import 'github-markdown-css/github-markdown.css';
import { renderApp } from '../Core/renderApp';
import { Dialog } from './Dialog';

// Remove previous reader mode instance
const id = 'text-hoarder-container';
const previousDialog = document.getElementById(id);
const alreadyOpen = previousDialog !== null;

if (alreadyOpen) previousDialog?.remove();
else {
  // Isolate from parent page's tabindex and scroll
  const dialog = document.createElement('dialog');
  dialog.id = id;
  dialog.style.width = '100vw';
  dialog.style.height = '100vh';
  dialog.style.maxWidth = 'none';
  dialog.style.maxHeight = 'none';
  dialog.style.margin = '0';
  dialog.style.padding = '0';
  dialog.style.position = 'fixed';
  dialog.style.overflow = 'hidden';
  dialog.style.border = 'none';
  dialog.style.outline = 'none';

  // Isolate from parent page's styles
  const dialogDiv = document.createElement('div');
  dialogDiv.style.display = 'contents';

  // Can't attach shadow directly to dialog
  const shadowRoot = dialogDiv.attachShadow({ mode: 'closed' });
  const container = document.createElement('div');
  container.classList.add('flex', 'justify-center', 'h-full', 'overflow-auto');

  // Can't use rem as those can be affected by host webpage
  container.style.fontSize = '16px';
  container.style.lineHeight = '24px';

  shadowRoot.append(container);
  dialog.append(dialogDiv);
  const originalRemove = dialog.remove;
  dialog.remove = (...args: []) => {
    unmount();
    restoreBodyScroll();
    dialog.remove = originalRemove;
    return dialog.remove(...args);
  };
  document.body.append(dialog);

  dialog.showModal();
  preventBodyScroll();
  const unmount = renderApp(container, Dialog, shadowRoot);

  dialog.addEventListener('close', dialog.remove, { once: true });
}

function preventBodyScroll(): void {
  document.body.style.setProperty('--old-height', document.body.style.height);
  document.body.style.setProperty(
    '--old-overflow-y',
    document.body.style.overflowY,
  );
  document.body.style.height = '100vh';
  document.body.style.overflowY = 'hidden';
}

function restoreBodyScroll(): void {
  document.body.style.height =
    document.body.style.getPropertyValue('--old-height');
  document.body.style.overflowY =
    document.body.style.getPropertyValue('--old-overflow-y');
  document.body.style.setProperty('--old-height', '');
  document.body.style.setProperty('--old-overflow-y', '');
}
