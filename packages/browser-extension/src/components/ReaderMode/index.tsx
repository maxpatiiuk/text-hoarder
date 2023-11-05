/**
 * This script is called by background scrip on keyboard shortcut press - it is
 * executed in the page that was active when action was triggered.
 */

import 'github-markdown-css/github-markdown.css';
import { renderApp } from '../Core/renderApp';
import { Dialog } from './Dialog';
import { shouldAutoTrigger } from '../ExtractContent/shouldAutoTrigger';
import {
  SimpleDocument,
  documentToSimpleDocument,
} from '../ExtractContent/documentToSimpleDocument';
import React from 'react';
import { listenEvent } from '../Background/messages';
import { scrollToMatchingNode } from '../ExtractContent/scrollToMatchingNode';
import { preserveTextSelection } from '../ExtractContent/preserveTextSelection';
import { catchErrors } from '../Errors/assert';

// FEATURE: add local stats CLI
// FEATURE: add local text-to-speech CLI
// FINAL: do accessibility testing
// FINAL: Review all code and remove unused/simplify
// FINAL: either make options page content look nicer, or remove options page
// LOW: use signed commits https://github.com/orgs/community/discussions/50055

// FINAL: Deploy cors-auth-middleware to vercel
// FINAL: Sync example config files with changes in real config files
// FINAL: Add github repository description and meta (home url, setup url)
// FINAL: Add description and meta data for github app (and "Add a note to users")
// FINAL: Add documentation & screenshots & video (compare to calendar plus
//   documentation)
// FINAL:  Add description and action.default_title in manifest.json
// FINAL: Add to portfolio
// FINAL: Submit to Chrome Web Store and post link in several places
// FINAL: In GitHub App settings, set "Make this GitHub App public" to allow others
//   to install the app

// Remove previous reader mode instance
const id = 'text-hoarder-container';
const previousDialog = document.getElementById(id);
const alreadyOpen = previousDialog !== null;

const activatedReason = new Promise((resolve) => {
  const stopListening = listenEvent('ActivateExtension', ({ action }) => {
    stopListening();
    resolve(action);
  });
});

if (alreadyOpen) previousDialog?.remove();
else {
  const scrollToMatchingElement = catchErrors(scrollToMatchingNode);
  const preserveSelection = catchErrors(preserveTextSelection);
  const autoTrigger = shouldAutoTrigger();
  const simpleDocument = documentToSimpleDocument();
  const render = () =>
    displayDialog(simpleDocument, (containerElement, mode) => {
      scrollToMatchingElement?.(containerElement, mode);
      preserveSelection?.(containerElement);
    });

  /**
   * If page doesn't look readable, or failed to extract content, then wait for
   * background script to tell us how the extension was activated:
   *  - If automatically, then don't do anything
   *  - If manually by user, then display the dialog with an error message
   */
  if (!autoTrigger || simpleDocument === undefined)
    activatedReason.then((action) =>
      action === 'automaticTrigger' ? undefined : render(),
    );
  else render();
}

function displayDialog(
  simpleDocument: SimpleDocument | undefined,
  scrollToMatchingElement: (
    containerElement: Element,
    mode: 'smooth' | 'instant' | 'none',
  ) => void,
): void {
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

  // Can't attach shadow directly to dialog, so create an intermediate
  const dialogDiv = document.createElement('div');
  dialogDiv.style.display = 'contents';

  // Isolate from parent page's styles
  const shadowRoot = dialogDiv.attachShadow({ mode: 'closed' });
  const container = document.createElement('div');

  container.classList.add('flex', 'justify-center', 'h-full', 'overflow-auto');

  shadowRoot.append(container);
  dialog.append(dialogDiv);

  /**
   * Override instance method so that if ReaderMode bundle is connected to page
   * again, it can properly dispose of previous instance (i.e toggle the reader)
   */
  const originalRemove = dialog.remove;
  dialog.remove = (...args: []) => {
    unmount();
    restoreBodyScroll();
    dialog.remove = originalRemove;
    // Trying to be as transparent with the override as possible
    return dialog.remove(...args);
  };
  document.body.append(dialog);

  dialog.showModal();
  preventBodyScroll();
  const unmount = renderApp(
    container,
    <Dialog
      simpleDocument={simpleDocument}
      onRestoreScroll={scrollToMatchingElement}
    />,
    shadowRoot,
  );

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
