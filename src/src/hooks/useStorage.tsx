import React from 'react';

import type { IR } from '../utils/types';
import { ensure, setDevelopmentGlobal } from '../utils/types';
import { useAsyncState } from './useAsyncState';

type StorageItem<T> = {
  readonly type: 'local' | 'sync';
  readonly defaultValue: T;
};

export const storageDefinitions = ensure<IR<StorageItem<unknown>>>()({
  accessToken: {
    type: 'local',
    defaultValue: undefined as undefined | string,
  },
  installationId: {
    type: 'local',
    defaultValue: undefined as undefined | number,
  },
  repositoryName: {
    type: 'local',
    defaultValue: undefined as undefined | string,
  },
} as const);

export type StorageDefinitions = typeof storageDefinitions;

export const storageLoading: unique symbol = Symbol('Storage Key Loading');
const storageMissing: unique symbol = Symbol('Storage Key Missing');

/**
 * A wrapper for extensions Storage API (without checking for cache version)
 */
export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
): readonly [
  StorageDefinitions[NAME]['defaultValue'] | undefined | typeof storageLoading,
  (value: StorageDefinitions[NAME]['defaultValue'] | undefined) => void,
] {
  const type = storageDefinitions[name].type;
  const storage = chrome.storage[type];

  const [value, setValue] = useAsyncState<
    StorageDefinitions[NAME]['defaultValue'] | typeof storageMissing
  >(
    React.useCallback(
      async () =>
        storage.get(name).then(async (storage) => {
          const value = storage[name];
          setDevelopmentGlobal(`_${name}`, value);
          return name in storage
            ? (value as StorageDefinitions[NAME]['defaultValue'] | undefined)
            : storageMissing;
        }),
      [name],
    ),
    false,
  );

  const updateValue = React.useCallback(
    (value: StorageDefinitions[NAME]['defaultValue'] | undefined) => {
      setDevelopmentGlobal(`_${name}`, value);
      setValue(value === undefined ? storageMissing : value);
      (value === undefined
        ? storage.remove(name)
        : storage.set({
            [name]: value,
          })
      ).catch(console.error);
    },
    [setValue, name, storage],
  );

  // Sync storage changes between instances of this hook
  React.useEffect(() => {
    function handleChange(changes: IR<chrome.storage.StorageChange>): void {
      if (!(name in changes)) return undefined;
      setValue(
        'newValue' in changes[name] ? changes[name]?.newValue : storageMissing,
      );
    }
    storage.onChanged.addListener(handleChange);
    return (): void => storage.onChanged.addListener(handleChange);
  }, [name, storage, setValue]);

  return [
    value === storageMissing
      ? storageDefinitions[name].defaultValue
      : value ?? storageLoading,
    updateValue,
  ];
}
