/**
 * This scrip is called from the stats page opened by the cli script
 */

import React from 'react';
import { readerText } from '../../../../common/src/localization/readerText';
import { renderApp } from '../../../../common/src/components/Core/renderApp';

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
document.title = readerText.textHoarder;

renderApp(container, <h1>{readerText.textHoarder}</h1>);
