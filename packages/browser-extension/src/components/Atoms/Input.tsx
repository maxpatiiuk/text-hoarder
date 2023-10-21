import { f } from '../../utils/functools';
import { className } from './className';
import { wrap } from './wrap';

export const Input = {
  Checkbox: wrap<
    'input',
    {
      readonly onValueChange?: (isChecked: boolean) => void;
      readonly type?: never;
      // This is used to forbid accidentally passing children
      readonly children?: undefined;
    }
  >(
    'Input.Checkbox',
    'input',
    `rounded-sm`,
    ({ onValueChange: handleValueChange, readOnly, ...props }) => ({
      ...props,
      type: 'checkbox',
      onChange(event): void {
        // Disable onChange when readOnly
        if (props.disabled === true || readOnly === true) return;
        handleValueChange?.((event.target as HTMLInputElement).checked);
        props.onChange?.(event);
      },
    }),
  ),
  Text: wrap<
  'input',
  {
    readonly onValueChange?: (value: string) => void;
    readonly type?: never;
    readonly children?: undefined;
  }
>(
  'Input.Text',
  'input',
  `${className.input} w-full`,
  ({ onValueChange: handleChange, ...props }) => ({
    ...props,
    type: 'text',
    onChange(event): void {
      handleChange?.((event.target as HTMLInputElement).value);
      props.onChange?.(event);
    },
  }),
),
  Number: wrap<
  'input',
  {
    readonly value: number | '';
    readonly onValueChange?: (value: number) => void;
    readonly type?: never;
    readonly children?: undefined;
  }
>(
  'Input.Number',
  'input',
  `${className.input} w-full`,
  ({ onValueChange: handleValueChange, ...props }) => ({
    ...props,
    type: 'number',
    onChange(event): void {
      handleValueChange?.(
        // This non-null assertion is unsafe, but simplifies typing
        f.parseFloat((event.target as HTMLInputElement).value)!,
      );
      props.onChange?.(event);
    },
  }),
),
  Generic: wrap<
  'input',
  {
    readonly onValueChange?: (value: string) => void;
    readonly children?: undefined;
  }
>(
  'Input.Generic',
  'input',
  `${className.input} w-full`,
  ({ onValueChange, ...props }) => ({
    ...props,
    onChange(event): void {
      onValueChange?.((event.target as HTMLInputElement).value);
      props.onChange?.(event);
    },
  }),
),
};
