import { icons } from './Icons';
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
  Icon: wrap<
    'button',
    {
      // Require title attribute
      readonly title: string;
      // Require passing one of the defined icons
      readonly icon: keyof typeof icons;
      // Don't allow passing children
      readonly children?: undefined;
      readonly onClick:
        | ((event: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined;
    }
  >('Button.Icon', 'button', className.icon, (props) => ({
    ...props,
    'aria-label': props['aria-label'] ?? props.title,
    type: 'button',
    disabled: props.disabled === true || props.onClick === undefined,
    children: icons[props.icon],
  })),
  LikeLink: wrap<
    'button',
    {
      // Make providing onClick mandatory
      onClick: ((event: MouseEvent) => void) | undefined;
    }
  >('Button.LikeLink', 'button', className.link, {
    type: 'button',
  }),
};
