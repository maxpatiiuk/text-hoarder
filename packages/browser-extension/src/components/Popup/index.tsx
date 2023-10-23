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
renderApp(container, Popup, document.body);

// FEATURE: use action.setIcon/setTitle/setBadgeText/setBadgeBackgroundColor to show if there are any saved texts for this page (https://developer.chrome.com/docs/extensions/reference/action/#badge)
