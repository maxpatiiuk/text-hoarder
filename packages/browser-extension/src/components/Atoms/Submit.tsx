import { className } from './className';
import { wrap } from './wrap';

const makeSubmit = (name: string, extraClassName: string) =>
  wrap<
    'input',
    { readonly value?: 'Use children instead'; readonly children: string }
  >(
    name,
    'input',
    `${className.button} ${extraClassName}`,
    ({ children, ...props }) => ({
      type: 'submit',
      ...props,
      value: children,
    })
  );

export const Submit = {
  Success: makeSubmit('Submit.Success', className.success),
  Danger: makeSubmit('Submit.Danger', className.danger),
  Info: makeSubmit('Submit.Info', className.info),
};
