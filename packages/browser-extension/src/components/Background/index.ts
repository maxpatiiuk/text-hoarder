/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import { emitEvent, type Requests } from './messages';
import { formatUrl } from '../../utils/queryString';
import { gitHubAppName } from '../../../config';

/**
 * Listen for a message from the front-end and send back the response
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
    // Only accept messages from the extension itself
    sender.id === chrome.runtime.id &&
    typeof request === 'object' &&
    request !== null &&
    request.type in requestHandlers
  ) {
    requestHandlers[request.type as 'ReloadExtension'](
      request.request as undefined,
      sender,
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
    sender: chrome.runtime.MessageSender,
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
  OpenUrl: (url, { tab }) =>
    chrome.tabs.create({ openerTabId: tab?.id, url }).then(() => undefined),
  async ReloadExtension() {
    chrome.tabs.reload();
    chrome.runtime.reload();
  },
};

chrome.action.onClicked.addListener((tab) => connect(tab, 'open'));
chrome.commands.onCommand.addListener((command, tab) =>
  command === 'open' ||
  command === 'saveText' ||
  command === 'editText' ||
  command === 'download'
    ? connect(tab, command)
    : undefined,
);

function connect(
  tab: chrome.tabs.Tab,
  action: 'open' | 'saveText' | 'editText' | 'download',
) {
  const tabId = tab.id;
  if (typeof tabId !== 'number' || tab.id === chrome.tabs.TAB_ID_NONE) return;

  const toggleReader = (): void =>
    void chrome.scripting
      .executeScript({
        target: { tabId },
        injectImmediately: true,
        files: ['./dist/readerMode.bundle.js'],
        world: 'ISOLATED',
      })
      .catch(console.error);

  if (action === 'open') toggleReader();
  else
    emitEvent(tabId, { type: 'ActivateExtension', action }).catch(toggleReader);
}
// FIXME: decide if keyboard shortcuts should work before first activation
