/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import type { Requests } from './messages';
import { emitEvent } from './messages';
import { formatUrl, parseUrl } from '../../utils/queryString';
import { corsAuthMiddlewareUrl, gitHubAppName } from '../../../config';
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
   * https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app#generating-a-user-access-token-when-a-user-installs-your-app
   * and
   * https://developer.chrome.com/docs/extensions/reference/identity/#method-launchWebAuthFlow
   */
  Authenticate: async ({ interactive }) => {
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
      .then(resolveAuthToken.bind(undefined, state))
      .then((response) => ({ type: 'Authenticated', ...response }) as const)
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
  // Example URL: https://bjknebjiadgjchmhppdfdiddfegmcaao.chromiumapp.org/?code=ace8eda36ec23fb106a1&installation_id=43127586&setup_action=install&state=13915511021528948
  callbackUrl: string | undefined,
): Promise<{ readonly token: string; readonly installationId: number }> {
  console.warn(callbackUrl);
  if (callbackUrl === undefined) throw new Error('Authentication was canceled');
  const {
    code,
    state: returnedState,
    installation_id: installationIdString,
  } = parseUrl(callbackUrl);
  const installationId = Number.parseInt(installationIdString);
  if (
    typeof code !== 'string' ||
    originalState !== returnedState ||
    Number.isNaN(installationId)
  )
    throw new Error('Authentication failed');
  return ajax(formatUrl(corsAuthMiddlewareUrl, { code }), {
    method: 'POST',
  })
    .then((response) => response.text())
    .then((token) => ({ token, installationId }));
}
