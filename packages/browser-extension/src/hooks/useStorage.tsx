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

import { setDevelopmentGlobal } from '@common/utils/types';
import { useAsyncState } from '@common/hooks/useAsyncState';
import { useLiveState } from '@common/hooks/useLiveState';
import {
  StorageDefinitions,
  listenForChanges,
  setStorage,
  storage,
  storageDefinitions,
} from '../utils/storage';
import { loadingGif } from '@common/hooks/useLoading';

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
      setStorage(name, value);
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

  return store === undefined ? (
    loadingGif
  ) : (
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
  React.useEffect(
    () => listenForChanges(name, setValue),
    [name, storage, setValue],
  );

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
