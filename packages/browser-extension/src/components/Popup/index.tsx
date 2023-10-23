import { popupText } from '../../localization/popupText';
import { Popup } from './Popup';
import { renderApp } from '../Core/renderApp';

document.title = popupText.textHoarder;

const container = document.createElement('div');
container.classList.add(
  'w-[20rem]',
  'h-[600px]',
  'flex',
  'flex-col',
  'gap-3',
  'p-4',
);
document.body.append(container);

/**
 * Make 1em = 1rem because I am forced to use em in ReaderMode due to root
 * font size being set by the host webpage, but I still want to get the benefits
 * of rem in the Popup (mainly, ability for user to change the default font
 * size via browser settings)
 */
document.body.style.fontSize = '1rem';

renderApp(container, Popup, document.body);

// FEATURE: use action.setIcon/setTitle/setBadgeText/setBadgeBackgroundColor to show if there are any saved texts for this page (https://developer.chrome.com/docs/extensions/reference/action/#badge)
