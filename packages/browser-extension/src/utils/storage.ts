import { IR, ensure } from '@common/utils/types';

export type Repository = {
  readonly owner: string;
  readonly name: string;
  readonly branch: string;
};

export const storageDefinitions = ensure<IR<unknown>>()({
  'auth.accessToken': undefined as undefined | string,
  'auth.installationId': undefined as undefined | number,
  'setup.repository': undefined as undefined | Repository,
  'extension.permissions': undefined as
    | undefined
    | chrome.permissions.Permissions,
  'ui.theme': 'system' as 'system' | 'light' | 'dark',
  'reader.allowScrollPastLastLine': false as boolean,
  'reader.downloadFormat': 'markdown' as 'html' | 'markdown' | 'text',
  'reader.fontSize': 16 as number,
  'reader.lineHeight': 1.5 as number,
  'reader.pageWidth': 60 as number,
  'reader.fontFamily': 'sans-serif' as 'sans-serif' | 'monospace' | 'serif',
  'reader.fontWeight': 400 as number,
  'reader.customCss': '' as string,
  'reader.autoTriggerUrls': '' as string,
  'reader.unfocusedMenuOpacity': 75 as number,
  'reader.eagerCheckForAlreadySaved': false as boolean,
  'reader.restoreScrollPosition': 'auto' as
    | 'auto'
    | 'smooth'
    | 'instant'
    | 'none',
  'markdownToText.includeImageAltText': true as boolean,
  'github.undoUsingForcePush': true as boolean,
} as const);

export const storage = chrome.storage.sync;
export type StorageDefinitions = typeof storageDefinitions;

export function listenForChanges<NAME extends keyof StorageDefinitions>(
  name: NAME,
  callback: (value: StorageDefinitions[NAME]) => void,
): () => void {
  function handleChange(changes: IR<chrome.storage.StorageChange>): void {
    if (!(name in changes)) return;
    callback(changes[name]?.newValue ?? storageDefinitions[name]);
  }
  storage.onChanged.addListener(handleChange);
  return (): void => storage.onChanged.addListener(handleChange);
}

export function listenToStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  callback: (value: StorageDefinitions[NAME]) => void,
): void {
  storage
    .get(name)
    .then((values) =>
      callback(
        (values[name] as StorageDefinitions[NAME]) ?? storageDefinitions[name],
      ),
    );
  listenForChanges(name, callback);
}

export function setStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  value: StorageDefinitions[NAME],
): void {
  const isDefaultValue = value === storageDefinitions[name];
  (value === undefined || isDefaultValue
    ? storage.remove(name)
    : storage.set({
        [name]: value,
      })
  ).catch(console.error);
}
