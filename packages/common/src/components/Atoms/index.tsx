import { className } from './className';
import { wrap } from './wrap';

export const Form = wrap(
  'Form',
  'form',
  'flex flex-col gap-2',
  ({ onSubmit: handleSubmit, ...props }) => ({
    ...props,
    onSubmit:
      typeof handleSubmit === 'function'
        ? (event) => {
            event.preventDefault();
            handleSubmit(event);
          }
        : undefined,
  }),
);

export const H1 = wrap('H1', 'h1', 'text-3xl font-bold');
export const H2 = wrap('H2', 'h2', 'text-2xl font-bold');
export const H3 = wrap('H3', 'h3', 'text-xl font-bold');
export const H4 = wrap('H4', 'h4', 'text-lg');

export const ErrorMessage = wrap(
  'ErrorMessage',
  'div',
  'flex flex-col gap-2 p-2 text-white bg-red-500 rounded',
  {
    role: 'alert',
    'aria-live': 'polite',
    'aria-atomic': true,
  },
);

export const Label = {
  Block: wrap('Label.Block', 'label', className.label),
  Inline: wrap('Label.Inline', 'label', className.labelForCheckbox),
};

export const WidgetSection = wrap(
  'WidgetSection',
  'section',
  'flex flex-col gap-4',
);
