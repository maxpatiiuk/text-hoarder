/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import type { Requests } from './messages';
import { emitEvent } from './messages';
import { formatUrl, parseUrl } from '../../utils/queryString';
import { gitHubClientId, authCorsMiddlewareUrl } from '../../../config';
import { ajax } from '../../utils/ajax';

// TODO: use this to listen to current URL. Also, check if there is a better way
/** Based on https://stackoverflow.com/a/50548409/8584605 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo?.status === 'complete')
    emitEvent(tabId, { type: 'TabUpdate' }).catch(console.trace);
});

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
        sendResponse(error);
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
   * https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
   */
  Authenticate: async ({ interactive }) => {
    const redirectUrl = chrome.identity.getRedirectURL();

    // For protection against CSRF attacks
    const state = Math.random().toString().slice(2);
    const authUrl = formatUrl('https://github.com/login/oauth/authorize', {
      client_id: gitHubClientId,
      redirect_uri: redirectUrl,
      state,
    });
    return chrome.identity
      .launchWebAuthFlow({
        url: authUrl,
        interactive,
      })
      .then(resolveAuthToken.bind(undefined, state))
      .then((token) => ({ type: 'Authenticated', token }) as const)
      .catch((error) => {
        console.error(error);
        return { type: 'Error', error: error.message };
      });
  },
  ReloadExtension: async () =>
    new Promise((resolve) => {
      chrome.tabs.reload();
      chrome.runtime.reload();
      resolve(undefined);
    }),
};

async function resolveAuthToken(
  originalState: string,
  // Example URL: https://bjknebjiadgjchmhppdfdiddfegmcaao.chromiumapp.org/?code=b9e350966d2079489b9f&state=0.016131138374419818
  callbackUrl: string | undefined,
): Promise<string> {
  if (callbackUrl === undefined) throw new Error('Authentication was canceled');
  const { code, state: returnedState } = parseUrl(callbackUrl);
  if (typeof code !== 'string' || originalState !== returnedState)
    throw new Error('Authentication failed');
  return ajax(formatUrl(authCorsMiddlewareUrl, { code }), {
    method: 'POST',
  }).then((response) => response.text());
}
