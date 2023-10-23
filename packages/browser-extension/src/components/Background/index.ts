/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import type { Requests } from './messages';
import { formatUrl } from '../../utils/queryString';
import { gitHubAppName } from '../../../config';

/**
 * Listen for a message from the front-end and send back the response
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (
    typeof request === 'object' &&
    request !== null &&
    request.type in requestHandlers
  ) {
    requestHandlers[request.type as 'ReloadExtension'](
      request.request as undefined,
    )
      .then(sendResponse)
      .catch((error) => {
        console.error(error);
        sendResponse({ type: 'Error', error: error.message });
      });
    return true;
  }
  return undefined;
});

/**
 * Handlers for the front-end requests
 */
const requestHandlers: {
  readonly [TYPE in Requests['type']]: (
    request: Extract<Requests, State<TYPE>>['request'],
  ) => Promise<Extract<Requests, State<TYPE>>['response']>;
} = {
  /**
   * See documentation at
   * https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app
   * and
   * https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app#generating-a-user-access-token-when-a-user-installs-your-app
   * and
   * https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
   */
  async Authenticate({ interactive }) {
    const redirectUrl = chrome.identity.getRedirectURL();

    // For protection against CSRF attacks
    const state = Math.random().toString().slice(2);
    const authUrl = formatUrl(
      `https://github.com/apps/${gitHubAppName}/installations/new`,
      {
        redirect_uri: redirectUrl,
        state,
      },
    );

    return chrome.identity
      .launchWebAuthFlow({
        url: authUrl,
        interactive,
      })
      .then((callbackUrl) => {
        if (callbackUrl === undefined)
          throw new Error('Authentication was canceled');
        else
          return {
            type: 'Authenticated',
            callbackUrl,
            originalState: state,
          } as const;
      });
  },
  async ReloadExtension() {
    chrome.tabs.reload();
    chrome.runtime.reload();
  },
};

chrome.commands.onCommand.addListener((command, tab) => {
  const tabId = tab.id;
  if (
    command === 'savePageText' &&
    typeof tabId === 'number' &&
    tabId !== chrome.tabs.TAB_ID_NONE
  )
    chrome.scripting.executeScript({
      target: { tabId },
      injectImmediately: true,
      files: ['./dist/readerMode.bundle.js'],
      world: 'ISOLATED',
    });
});
