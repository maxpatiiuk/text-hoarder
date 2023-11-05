import React from 'react';
import { Label } from '../../../../common/src/components/Atoms';
import {
  Input,
  Select,
  Textarea,
} from '../../../../common/src/components/Atoms/Input';
import { RR } from '../../../../common/src/utils/types';

export const Renderers = {
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
          <span>
            {label} <span aria-hidden>{`(${value})`}</span>
          </span>
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
    (label: string, placeholder: string) =>
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
          className="h-32"
          placeholder={placeholder}
        />
      </Label.Block>
    ),
};
