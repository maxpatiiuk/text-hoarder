import { f } from '../../utils/functools';
import { RA } from '../../utils/types';
import { split } from '../../utils/utils';
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
  Range: wrap<
    'input',
    {
      readonly value: number | '';
      readonly onValueChange?: (value: number) => void;
      readonly type?: never;
      readonly children?: undefined;
      readonly min: number;
      readonly max: number;
    }
  >(
    'Input.Range',
    'input',
    `${className.input} w-full`,
    ({ onValueChange: handleValueChange, ...props }) => ({
      ...props,
      type: 'range',
      onChange(event): void {
        handleValueChange?.(
          // This non-null assertion is unsafe, but simplifies typing
          f.parseFloat((event.target as HTMLInputElement).value)!,
        );
        props.onChange?.(event);
      },
    }),
  ),
};

export const selectMultipleSize = 4;
export const Select = wrap<
  'select',
  {
    readonly onValueChange?: (value: string) => void;
    readonly onValuesChange?: (value: RA<string>) => void;
  }
>(
  'Select',
  'select',
  className.select,
  ({ onValueChange, onValuesChange, ...props }) => ({
    ...props,
    /*
     * Required fields have blue background. Selected <option> in a select
     * multiple also has blue background. Those clash. Need to make required
     * select background slightly lighter
     */
    className: `${props.className ?? ''}${
      props.required === true &&
      (props.multiple === true ||
        (typeof props.size === 'number' && props.size > 1))
        ? ' bg-blue-100 dark:bg-blue-900'
        : ''
    }${typeof props.size === 'number' && props.size > 1 ? '' : ' p-1 rounded'}`,
    onChange(event): void {
      const options = Array.from(
        (event.target as HTMLSelectElement).querySelectorAll('option'),
      );
      const [unselected, selected] = split(options, ({ selected }) => selected);
      /*
       * Selected options in an optional multiple select are clashing with
       * the background in dark-mode. This is a fix:
       */
      if (props.required !== true && props.multiple === true) {
        selected.map((option) => option.classList.add('dark:bg-neutral-100'));
        unselected.map((option) =>
          option.classList.remove('dark:bg-neutral-100'),
        );
      }
      const value = (event.target as HTMLSelectElement).value;

      /*
       * Workaround for Safari weirdness. See more:
       * https://github.com/specify/specify7/issues/1371#issuecomment-1115156978
       */
      if (typeof props.size !== 'number' || props.size < 2 || value !== '')
        onValueChange?.(value);
      onValuesChange?.(selected.map(({ value }) => value));
      props.onChange?.(event);
    },
  }),
);

export const Textarea = wrap<
  'textarea',
  {
    readonly children?: undefined;
    readonly onValueChange?: (value: string) => void;
    readonly autoGrow?: boolean;
  }
>(
  'Textarea',
  'textarea',
  className.textArea,
  ({ onValueChange, ...props }) => ({
    ...props,
    onChange(event): void {
      onValueChange?.((event.target as HTMLTextAreaElement).value);
      props.onChange?.(event);
    },
  }),
);
