import React from 'react';
import { H2 } from '../Atoms';
import { preferencesText } from '../../localization/preferencesText';
import { StorageDefinitions, useStorage } from '../../hooks/useStorage';
import { definitions } from './definitions';

export function Preferences(): JSX.Element {
  return (
    <>
      <H2>{preferencesText.preferences}</H2>
      {Object.entries(definitions).map(([name, renderer]) => (
        <Item
          key={name}
          name={name as keyof StorageDefinitions}
          renderer={
            renderer as (
              value: StorageDefinitions[keyof StorageDefinitions],
              setValue: (
                newValue: StorageDefinitions[keyof StorageDefinitions],
                apply: boolean,
              ) => void,
            ) => JSX.Element
          }
        />
      ))}
    </>
  );
}

function Item<KEY extends keyof StorageDefinitions>({
  name: name,
  renderer,
}: {
  readonly name: KEY;
  readonly renderer: (
    value: StorageDefinitions[KEY],
    setValue: (newValue: StorageDefinitions[KEY], apply?: boolean) => void,
  ) => JSX.Element;
}): JSX.Element {
  const [value, setValue] = useStorage(name);
  const oldValueRef = React.useRef(value);
  const changed = oldValueRef.current !== value;
  const localValueRef = React.useRef(value);
  const [reRender, setReRender] = React.useState(false);
  if (changed) {
    localValueRef.current = value;
    oldValueRef.current = value;
  }

  return renderer(localValueRef.current, (newValue, apply = true) => {
    /*
     * Only change value on blur (to avoid UX issues with font size, and
     * avoid chrome storage quota issues if value changes often)
     */
    if (apply) setValue(newValue);
    else {
      setReRender(!reRender);
      localValueRef.current = newValue;
    }
  });
}
