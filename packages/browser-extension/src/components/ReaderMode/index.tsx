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
import { scrollToMatchingNode } from '../ExtractContent/scrollToMatchingNode';
import { preserveTextSelection } from '../ExtractContent/preserveTextSelection';
import { catchErrors } from '@common/components/Errors/assert';
import { renderExtension } from '../Core/renderExtension';
import { applyHostPageStyles, extensionContainerId } from './styles';

const activatedReason = chrome.storage.local.get('activatedReason');

// BUG: scroll loss on exiting reader mode (i.e in https://hackernoon.com/unleashing-the-power-of-typescript-improving-standard-library-types?utm_source=tldrwebdev)
// FEATURE: add local text-to-speech helper CLI
// FEATURE: if unable to extract information, but user had selected text, use that as information
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

const action = alreadyOpen
  ? () => previousDialog?.remove()
  : makeRenderFunction();

/*
 * Do as much work as we can while activatedReason is being determined to reduce
 * latency
 */
function makeRenderFunction() {
  const scrollToMatchingElement = catchErrors(scrollToMatchingNode);
  const preserveSelection = catchErrors(preserveTextSelection);
  const autoTrigger = shouldAutoTrigger();
  const simpleDocument = documentToSimpleDocument();

  const canAutoTrigger = autoTrigger && typeof simpleDocument === 'object';
  return (activatedReason: 'automaticTrigger' | 'open') => {
    /**
     * If page doesn't look readable, or failed to extract content, and
     * extension was activated automatically, then don't do anything. If
     * extension was triggered by user, a display dialog with an error message
     */
    if (!canAutoTrigger && activatedReason === 'automaticTrigger') return;

    displayDialog(simpleDocument, (containerElement, mode) => {
      scrollToMatchingElement?.(containerElement, mode);
      preserveSelection?.(containerElement);
    });
  };
}

/**
 * Can't display or hide the dialog until we know if extension was triggered
 * automatically or manually. Unfortunately, when script is called via
 * chrome.scripting.executeScript, there is no way to pass arguments. Sending
 * message and waiting for it adds large amount of latency. Thus, relying on
 * local storage to pass the argument.
 *
 * The storage approach still ads 80ms, and mail fail if multiples tabs are
 * opened at the same time, but that's the best I could come up with.
 *
 * The other solution is to have two separate ReaderMode bundles (3.5mb) that
 * would differ only in the value of isAutomaticTrigger boolean at the top, but
 * that seems rather inefficient.
 */
activatedReason.then(({ activatedReason }) => {
  const symbol = Symbol.for('text-hoarder-was-activated');
  const wasActivatedBefore =
    Object.getOwnPropertyDescriptor(window, symbol)?.value === true;
  /**
   * Since automated trigger is waiting for page to load, it may be called
   * late, and user might have manually activated the page in the meanwhile.
   * Also, for some pages the page can pass from loading to loaded multiple
   * times
   * (i.e https://www.theverge.com/23935029/microsoft-edge-forced-windows-10-google-chrome-fight)
   * In such case don't do anything:
   */
  if (wasActivatedBefore && activatedReason === 'automaticTrigger') return;
  Object.defineProperty(window, symbol, { value: true, enumerable: false });

  chrome.storage.local.remove('activatedReason');

  action(activatedReason);
});

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

  // Prevent scrolljacking 😡
  dialog.addEventListener('scroll', (event) => event.stopPropagation(), {
    capture: true,
    passive: false,
  });
  dialog.addEventListener('wheel', (event) => event.stopPropagation(), {
    capture: true,
    passive: false,
  });
  dialog.addEventListener('touchmove', (event) => event.stopPropagation(), {
    capture: true,
    passive: false,
  });

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
