/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import { ActivateExtension, emitEvent, type Requests } from './messages';
import { formatUrl, parseUrl } from '@common/utils/queryString';
import { corsAuthMiddlewareUrl, gitHubAppName } from '../../../config';
import { RA } from '@common/utils/types';
import { preparePatterns, urlMatches } from '../ReaderMode/matchUrl';
import { listenToStorage, setStorage } from '../../utils/storage';
import { ajax } from '@common/utils/ajax';

/**
 * Listen for a message from the front-end and send back the response
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
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

    const callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive,
    });

    if (callbackUrl === undefined)
      throw new Error('Authentication was canceled');
    const response = await resolveAuthToken({
      callbackUrl,
      originalState: state,
    });
    return { type: 'Authenticated', ...response };
  },

  OpenUrl: (url, { tab }) =>
    chrome.tabs.create({ openerTabId: tab?.id, url }).then(() => undefined),

  OpenPreferences: async () => void chrome.runtime.openOptionsPage(),

  async ReloadExtension() {
    chrome.tabs.reload();
    chrome.runtime.reload();
  },

  async UpdateBadge(text, { tab }) {
    await chrome.action.setBadgeText({ text: text ?? '', tabId: tab?.id });
    await chrome.action.setBadgeBackgroundColor({
      color: '#f77',
      tabId: tab?.id,
    });
  },
};

chrome.action.onClicked.addListener((tab) => connect(tab.id, 'open'));
chrome.commands.onCommand.addListener((command, tab) =>
  command === 'saveText' || command === 'editText' || command === 'download'
    ? connect(tab.id, command)
    : undefined,
);

function connect(
  tabId: number | undefined,
  action: ActivateExtension['action'],
) {
  if (typeof tabId !== 'number' || tabId === chrome.tabs.TAB_ID_NONE) return;

  const toggleReader = (): Promise<void> =>
    chrome.storage.local
      .set({ activatedReason: action })
      .then(() =>
        chrome.scripting.executeScript({
          target: { tabId },
          injectImmediately: true,
          files: ['./dist/readerMode.bundle.js'],
          world: 'ISOLATED',
        }),
      )
      .then(() => emit(false))
      .catch(console.error);

  const emit = (retry: boolean): Promise<void> =>
    emitEvent(tabId, { type: 'ActivateExtension', action }).catch(
      retry ? toggleReader : () => {},
    );

  if (action === 'open') toggleReader();
  else emit(true);
}

let matchUrls: RA<string | RegExp> = [];
listenToStorage('reader.autoTriggerUrls', async (value) => {
  matchUrls = preparePatterns(value);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    typeof tab.url === 'string' &&
    urlMatches(tab.url, matchUrls)
  )
    connect(tabId, 'automaticTrigger');
});

/**
 * Note, if user changes from all sites to none, or wise versa, these events
 * aren't fired((
 */
const updatePermissions = (): Promise<void> =>
  chrome.permissions
    .getAll()
    .then((permissions) => setStorage('extension.permissions', permissions))
    .catch(console.error);
updatePermissions();
chrome.permissions.onAdded.addListener(updatePermissions);
chrome.permissions.onRemoved.addListener(updatePermissions);

/*
// FINAL: add install/uninstall URLs?
chrome.runtime.onInstalled.addListener(({ reason }) =>
  reason === 'install'
    ? chrome.tabs.create({
        url: 'INSTALLED'
      })
    : undefined
);
chrome.runtime.setUninstallURL('UNINSTALLED');
// FINAL: add migration scripts when necessary
runtime.onUpdate(async details => {
    if (details.previousVersion[0] < '9' && runtime.getCurrentVersion() >
        '8.0.0') {
        await action.migrateStorage()
    }
})
 */

async function resolveAuthToken({
  callbackUrl,
  originalState,
}: {
  // Example URL: https://bjknebjiadgjchmhppdfdiddfegmcaao.chromiumapp.org/?code=ace8eda36ec23fb106a1&installation_id=43127586&setup_action=install&state=13915511021528948
  callbackUrl: string | undefined;
  originalState: string;
}): Promise<{ readonly token: string; readonly installationId: number }> {
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
  /**
   * This request should be made from the background script rather than host
   * page for security reasons (to avoid CORS issues, and to avoid tampering
   * with the response)
   */
  return ajax(formatUrl(corsAuthMiddlewareUrl, { code }), {
    method: 'POST',
  })
    .then((response) => response.text())
    .then((token) => ({ token, installationId }));
}
