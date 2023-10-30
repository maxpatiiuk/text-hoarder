import React from 'react';
import { H1, H2, H3 } from '../Atoms';
import { preferencesText } from '../../localization/preferencesText';
import { IsPreferencesStandalone } from './Context';
import { StorageDefinitions, useStorage } from '../../hooks/useStorage';
import { definitions } from './definitions';
import { RequestUrlPermissions } from './AutoTriggerUrls';

export function Preferences(): JSX.Element {
  const isStandalone = React.useContext(IsPreferencesStandalone);
  const Header1 = isStandalone ? H1 : H2;
  const Header2 = isStandalone ? H2 : H3;
  return (
    <>
      <Header1>{preferencesText.preferences}</Header1>
      {
        /*
         * If there are missing permissions when page is opened, it's likely that
         * user followed the link from the preferences sidebar after trying to
         * make reader open automatically for a few URLS - display the permissions
         * prompt at the top of the page so that it's immediately visible.
         */
        isStandalone && <RequestUrlPermissions position="top" />
      }
      {Object.entries(definitions).map(([header, entries]) => (
        <React.Fragment key={header}>
          <Header2>{header}</Header2>
          {Object.entries(entries).map(([name, renderer]) => (
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
        </React.Fragment>
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
