import { className } from './className';
import { wrap } from './wrap';

const makeButton = (name: string, extraClassName: string) =>
  wrap<
    'button',
    {
      // Make providing onClick mandatory
      onClick: ((event: MouseEvent) => void) | undefined;
    }
  >(name, 'button', `${className.button} ${extraClassName}`, {
    type: 'button',
  });

export const Button = {
  Success: makeButton('Button.Success', className.success),
  Danger: makeButton('Button.Danger', className.danger),
  Info: makeButton('Button.Info', className.info),
};
