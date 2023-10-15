import { IR, RR } from '../../utils/types';
import { className } from './className';
import { TagProps, wrap } from './wrap';

/**
 * A wrapper for wrap() to generate links that have [href] attribute required
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const linkComponent = <EXTRA_PROPS extends IR<unknown> = RR<never, never>>(
  name: string,
  className: string,
  initialProps?:
    | TagProps<'a'>
    | ((props: Readonly<EXTRA_PROPS> & TagProps<'a'>) => TagProps<'a'>)
) =>
  wrap<
    'a',
    EXTRA_PROPS & {
      readonly href: string;
    }
  >(name, 'a', className, initialProps);


export const Link = {
  Default: linkComponent('Link.Default', className.link),
  Success: linkComponent(
    'Link.Success',
    `${className.button} ${className.success}`,
  ),
  Danger: linkComponent('Link.Danger', `${className.button} ${className.danger}`),
  Info: linkComponent('Link.Info', `${className.button} ${className.info}`),
};
