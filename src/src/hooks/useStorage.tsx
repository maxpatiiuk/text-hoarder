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
  accessToken: undefined as undefined | string,
  installationId: undefined as undefined | number,
  repositoryName: undefined as undefined | string,
} as const);

const StorageContext = React.createContext<Store>({
  get: () => undefined,
  set: () => undefined,
});
StorageContext.displayName = 'StorageContext';

type Store = {
  readonly get: <NAME extends keyof StorageDefinitions>(
    name: NAME,
  ) => StorageDefinitions[NAME] | undefined;
  readonly set: <NAME extends keyof StorageDefinitions>(
    _name: NAME,
    _value: StorageDefinitions[NAME] | undefined,
  ) => void;
};

export type StorageDefinitions = Partial<typeof storageDefinitions>;

const storage = chrome.storage.local;

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
          .then((values) =>
            Object.fromEntries(
              Object.entries(storageDefinitions).map(([key, defaultValue]) => [
                key,
                values[key] ?? defaultValue,
              ]),
            ),
          ),
      [],
    ),
    true,
  );
  setDevelopmentGlobal(`_store`, store);

  const set = React.useCallback(
    <NAME extends keyof StorageDefinitions>(
      name: NAME,
      value: StorageDefinitions[NAME] | undefined,
    ): void => {
      setStore((store) => ({ ...store, [name]: value }));
      (value === undefined
        ? storage.remove(name)
        : storage.set({
            [name]: value,
          })
      ).catch(console.error);
    },
    [setStore],
  );

  const storeRef = React.useRef(store);
  storeRef.current = store;
  const get = React.useCallback(
    <NAME extends keyof StorageDefinitions>(
      name: NAME,
    ): StorageDefinitions[NAME] | undefined => storeRef.current?.[name],
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
  StorageDefinitions[NAME] | undefined,
  (value: StorageDefinitions[NAME] | undefined) => void,
] {
  const { get, set } = React.useContext(StorageContext);
  const [value, setValue] = useLiveState(
    React.useCallback(() => get(name), [get, name]),
  );

  // Sync storage changes between instances of this hook
  React.useEffect(() => {
    function handleChange(changes: IR<chrome.storage.StorageChange>): void {
      if (!(name in changes)) return undefined;
      setValue(changes[name]?.newValue);
    }
    storage.onChanged.addListener(handleChange);
    return (): void => storage.onChanged.addListener(handleChange);
  }, [name, storage, setValue]);

  const update = React.useCallback(
    (value: StorageDefinitions[NAME] | undefined) => set(name, value),
    [set, name],
  );
  return [value, update];
}
