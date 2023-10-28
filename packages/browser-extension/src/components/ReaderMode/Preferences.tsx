import React from 'react';
import { H2, Label } from '../Atoms';
import { Input, Select, Textarea } from '../Atoms/Input';
import { preferencesText } from '../../localization/preferencesText';
import { StorageDefinitions, useStorage } from '../../hooks/useStorage';
import { RR } from '../../utils/types';

// FIXME: integrate preferences with css variables and other logic
// FIXME: add more preferences?
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

const Renderers = {
  Select:
    <T extends string>(label: string, values: RR<T, string>) =>
    (
      value: T,
      setValue: (newValue: T, apply: boolean) => void,
    ): JSX.Element => (
      <Label.Block>
        {label}
        <Select
          value={value}
          onValueChange={(value): void => setValue(value as T, true)}
          size={Object.keys(values).length}
        >
          {Object.entries<string>(values).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </Label.Block>
    ),
  Checkbox:
    (label: string) =>
    (
      value: boolean,
      setValue: (newValue: boolean, apply: boolean) => void,
    ): JSX.Element => (
      <Label.Inline>
        <Input.Checkbox
          checked={value}
          onValueChange={(newValue): void => setValue(newValue, true)}
        />
        {label}
      </Label.Inline>
    ),
  Range:
    (
      label: string,
      props: {
        readonly min: number;
        readonly max: number;
        readonly step: number;
      },
    ) =>
    (
      value: number,
      setValue: (newValue: number, apply: boolean) => void,
    ): JSX.Element => {
      return (
        <Label.Block>
          {label}
          <Input.Range
            {...props}
            value={value}
            onValueChange={(value) => setValue(value, false)}
            onBlur={(): void => setValue(value, true)}
          />
        </Label.Block>
      );
    },
  TextArea:
    (label: string) =>
    (
      value: string,
      setValue: (newValue: string, apply: boolean) => void,
    ): JSX.Element => (
      <Label.Block>
        {label}
        <Textarea
          value={value}
          onValueChange={(value) => setValue(value, false)}
          onBlur={(): void => setValue(value, true)}
        />
      </Label.Block>
    ),
};

const definitions: Partial<{
  readonly [KEY in keyof StorageDefinitions]: (
    value: StorageDefinitions[KEY],
    setValue: (newValue: StorageDefinitions[KEY], apply?: boolean) => void,
  ) => JSX.Element;
}> = {
  'ui.theme': Renderers.Select(preferencesText.theme, {
    system: preferencesText.system,
    light: preferencesText.light,
    dark: preferencesText.dark,
  }),
  'reader.allowScrollPastLastLine': Renderers.Checkbox(
    preferencesText.allowScrollPastLastLine,
  ),
  'reader.downloadFormat': Renderers.Select(preferencesText.downloadFormat, {
    html: preferencesText.html,
    markdown: preferencesText.markdown,
    text: preferencesText.text,
  }),
  'reader.fontSize': Renderers.Range(preferencesText.fontSize, {
    min: 5,
    max: 100,
    step: 0.5,
  }),
  'reader.lineHeight': Renderers.Range(preferencesText.lineHeight, {
    min: 0.1,
    max: 4,
    step: 0.1,
  }),
  'reader.pageWidth': Renderers.Range(preferencesText.lineHeight, {
    min: 20,
    max: 200,
    step: 1,
  }),
  'reader.customCss': Renderers.TextArea(preferencesText.customCss),
};

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
    else localValueRef.current = newValue;
  });
}

// FEATURE: allow for custom css
// FEATURE: make preferences also accessible at options_page (or instead of this)
// FEATURE: allow font family customization
