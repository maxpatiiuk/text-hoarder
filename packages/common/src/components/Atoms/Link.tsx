import { IR, RR } from '../../utils/types';
import { icons } from './Icons';
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
    | ((props: Readonly<EXTRA_PROPS> & TagProps<'a'>) => TagProps<'a'>),
) =>
  wrap<
    'a',
    EXTRA_PROPS & {
      readonly href: string;
    }
  >(name, 'a', className, initialProps);

export const Link = {
  Default: linkComponent('Link.Default', className.link, {
    target: '_blank',
    rel: 'noopener',
  }),
  Info: linkComponent('Link.Info', `${className.button} ${className.info}`, {
    target: '_blank',
    rel: 'noopener',
  }),
  Icon: wrap<
    'a',
    {
      // Require title attribute
      readonly title: string;
      // Require passing one of the defined icons
      readonly icon: keyof typeof icons;
      // Don't allow passing children
      readonly children?: undefined;
      readonly href: string;
    }
  >('Link.Icon', 'a', className.icon, (props) => ({
    ...props,
    'aria-label': props['aria-label'] ?? props.title,
    type: 'button',
    children: icons[props.icon],
    target: '_blank',
    rel: 'noopener',
  })),
};
