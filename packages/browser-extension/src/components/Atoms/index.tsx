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

export const Centered = wrap(
  'Centered',
  'div',
  'flex items-center flex-col gap-4 justify-center w-screen h-screen text-center',
);

export const H1 = wrap('H1', 'h1', 'text-3xl font-bold');
export const H2 = wrap('H1', 'h1', 'text-2xl font-bold');

export const ErrorMessage = wrap(
  'ErrorMessage',
  'p',
  'flex flex-col gap-2 p-2 text-white bg-red-500 rounded',
  {
    role: 'alert',
  },
);

export const Label = {
  Block: wrap('Label.Block', 'label', className.label),
  Inline: wrap('Label.Inline', 'label', className.labelForCheckbox),
};
