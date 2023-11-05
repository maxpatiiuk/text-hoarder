/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import { ActivateExtension, emitEvent, type Requests } from './messages';
import { formatUrl } from '../../../../common/src/utils/queryString';
import { gitHubAppName } from '../../../config';
import { RA } from '../../../../common/src/utils/types';
import { preparePatterns, urlMatches } from '../ReaderMode/matchUrl';
import { listenToStorage, setStorage } from '../../utils/storage';

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
    chrome.scripting
      .executeScript({
        target: { tabId },
        injectImmediately: true,
        files: ['./dist/readerMode.bundle.js'],
        world: 'ISOLATED',
      })
      .then(() => emit(false))
      .catch(console.error);

  const emit = (retry: boolean): Promise<void> =>
    emitEvent(tabId, { type: 'ActivateExtension', action }).catch(
      retry ? toggleReader : () => {},
    );

  if (action === 'open') toggleReader();
  else emit(true);
}
// FIXME: decide if keyboard shortcuts should work before first activation

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
