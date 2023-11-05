/**
 * This scrip is called from the stats page opened by the cli script
 */

import React from 'react';
import { renderApp } from '@common/components/Core/renderApp';
import { commonText } from '@common/localization/commonText';

const container = document.createElement('main');

container.classList.add(
  'flex',
  'h-full',
  'overflow-auto',
  'dark:bg-neutral-800',
  'dark:text-gray-100',
  'min-h-screen',
);

document.body.append(container);
document.title = commonText.textHoarder;

renderApp(container, <h1>{commonText.textHoarder}</h1>);
