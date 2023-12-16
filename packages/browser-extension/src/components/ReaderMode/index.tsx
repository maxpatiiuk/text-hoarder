/**
 * This script is called by background scrip on keyboard shortcut press - it is
 * executed in the page that was active when action was triggered.
 */

import 'github-markdown-css/github-markdown.css';
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
import { catchErrors } from '@common/components/Errors/assert';
import { renderExtension } from '../Core/renderExtension';
import { applyHostPageStyles, extensionContainerId } from './styles';

// BUG: scroll loss on exiting reader mode (i.e in https://hackernoon.com/unleashing-the-power-of-typescript-improving-standard-library-types?utm_source=tldrwebdev)
// FEATURE: add local text-to-speech helper CLI
// LOW: add stats UI to the web extension (https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#download-a-repository-archive-tar amd https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)
// FEATURE: consider adding more text pre-processing steps to the extension rather than the CLI
// FINAL: do accessibility testing
// FINAL: add webpack dev server for stats? https://morioh.com/a/c6e73ed575bb/how-to-package-nodejs-application-using-webpack#google_vignette
// FINAL: Review all code and remove unused/simplify
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
const previousDialog = document.getElementById(extensionContainerId);
const alreadyOpen = previousDialog !== null;

// BUG: if already open, delayed "ActiveExtension" should not close again
// FEATURE: if unable to extract information, but user had selected text, use that as information
const activatedReason = new Promise((resolve) => {
  const stopListening = listenEvent('ActivateExtension', ({ action }) => {
    stopListening();
    resolve(action);
  });
});

if (alreadyOpen) {
  previousDialog?.remove();
} else {
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
  dialog.id = extensionContainerId;
  dialog.autofocus = true;
  dialog.style.width = '100vw';
  dialog.style.height = '100vh';
  dialog.style.maxWidth = 'none';
  dialog.style.maxHeight = 'none';
  dialog.style.margin = '0';
  dialog.style.padding = '0';
  dialog.style.position = 'fixed';
  dialog.style.border = 'none';
  dialog.style.outline = 'none';

  // Can't attach shadow directly to dialog, so create an intermediate
  const dialogDiv = document.createElement('div');
  dialogDiv.style.display = 'contents';

  // Isolate from parent page's styles
  const shadowRoot = dialogDiv.attachShadow({ mode: 'closed' });
  const container = document.createElement('div');

  container.classList.add('flex', 'h-max', 'overflow-auto');

  shadowRoot.append(container);
  dialog.append(dialogDiv);

  const restoreHostPageStyles = applyHostPageStyles();

  /**
   * Override instance method so that if ReaderMode bundle is connected to page
   * again, it can properly dispose of previous instance (i.e toggle the reader)
   */
  const originalRemove = dialog.remove;
  dialog.remove = (...args: []) => {
    unmount();
    restoreHostPageStyles();
    dialog.remove = originalRemove;
    // Trying to be as transparent with the override as possible
    return dialog.remove(...args);
  };
  document.body.append(dialog);

  dialog.showModal();
  const unmount = renderExtension(
    container,
    <Dialog
      simpleDocument={simpleDocument}
      onRestoreScroll={scrollToMatchingElement}
    />,
    shadowRoot,
  );

  dialog.addEventListener('close', dialog.remove, { once: true });
}
