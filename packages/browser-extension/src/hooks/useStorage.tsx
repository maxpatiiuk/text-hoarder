/**
 * A wrapper for extensions Storage API
 *
 * Benefits
 * - Type safe - explicitly define the storage keys and their types
 * - Synchronous - the StorageContext takes care of loading values for all keys
 *   ahead of time, so that they are available synchronously by the time the
 *   components need them - simplifies code a lot (don't have to treat no value
 *   and value loading as separate cases)
 */

import React from 'react';

import type { IR } from '../utils/types';
import { ensure, setDevelopmentGlobal } from '../utils/types';
import { useAsyncState } from './useAsyncState';
import { useLiveState } from './useLiveState';

export const storageDefinitions = ensure<IR<unknown>>()({
  'auth.accessToken': undefined as undefined | string,
  'auth.installationId': undefined as undefined | number,
  'setup.repositoryName': undefined as undefined | string,
  'ui.theme': 'system' as 'system' | 'light' | 'dark',
  'reader.allowScrollPastLastLine': false as boolean,
  'reader.downloadFormat': 'markdown' as 'html' | 'markdown' | 'text',
  'reader.fontSize': 16 as number,
  'reader.lineHeight': 1.5 as number,
  'reader.pageWidth': 60 as number,
  'reader.fontFamily': 'sans-serif' as 'sans-serif' | 'monospace' | 'serif',
  'reader.customCss': '' as string,
  'markdownToText.includeImageAltText': true as boolean,
} as const);

const StorageContext = React.createContext<Store>({
  get: () => undefined!,
  set: () => undefined,
});
StorageContext.displayName = 'StorageContext';

type Store = {
  readonly get: <NAME extends keyof StorageDefinitions>(
    name: NAME,
  ) => StorageDefinitions[NAME];
  readonly set: <NAME extends keyof StorageDefinitions>(
    _name: NAME,
    _value: StorageDefinitions[NAME],
  ) => void;
};

export type StorageDefinitions = typeof storageDefinitions;

const storage = chrome.storage.sync;

export function StorageProvider({
  children,
}: {
  readonly children: JSX.Element;
}): JSX.Element | undefined {
  const [store, setStore] = useAsyncState(
    React.useCallback(
      () =>
        storage
          .get(Object.keys(storageDefinitions))
          .then(
            (values) =>
              Object.fromEntries(
                Object.entries(storageDefinitions).map(
                  ([key, defaultValue]) => [key, values[key] ?? defaultValue],
                ),
              ) as StorageDefinitions,
          ),
      [],
    ),
    true,
  );
  setDevelopmentGlobal(`_store`, store);

  const storeRef = React.useRef(store);
  storeRef.current = store;

  const set = React.useCallback(
    <NAME extends keyof StorageDefinitions>(
      name: NAME,
      value: StorageDefinitions[NAME],
    ): void => {
      if (storeRef.current === undefined) return;
      setStore({ ...storeRef.current, [name]: value });
      const isDefaultValue = value === storageDefinitions[name];
      (value === undefined || isDefaultValue
        ? storage.remove(name)
        : storage.set({
            [name]: value,
          })
      ).catch(console.error);
    },
    [setStore],
  );

  const get = React.useCallback(
    <NAME extends keyof StorageDefinitions>(
      name: NAME,
    ): StorageDefinitions[NAME] =>
      storeRef.current?.[name] ?? storageDefinitions[name],
    [],
  );
  const context = React.useMemo((): Store => ({ get, set }), [get, set]);

  return store === undefined ? undefined : (
    <StorageContext.Provider value={context}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
): readonly [
  StorageDefinitions[NAME],
  (value: StorageDefinitions[NAME]) => void,
] {
  const { get, set } = React.useContext(StorageContext);
  const [value, setValue] = useLiveState(
    React.useCallback(() => get(name), [get, name]),
  );

  // Sync storage changes between instances of this hook
  React.useEffect(() => {
    function handleChange(changes: IR<chrome.storage.StorageChange>): void {
      if (!(name in changes)) return;
      setValue(changes[name]?.newValue);
    }
    storage.onChanged.addListener(handleChange);
    return (): void => storage.onChanged.addListener(handleChange);
  }, [name, storage, setValue]);

  const update = React.useCallback(
    (value: StorageDefinitions[NAME]) => {
      set(name, value);
      /*
       * The onChanged is not triggered fast enough - causes UI flickering
       * when useStorage is used as value for <Select>, and user changes value.
       *
       * Thus, have to manually change the value here ahead of time.
       * Note, this may cause a race condition if the value changes often
       */
      setValue(value);
    },
    [set, name],
  );
  return [value ?? storageDefinitions[name], update];
}
