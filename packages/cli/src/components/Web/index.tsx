/**
 * This script is called from the stats page opened by the CLI script
 */

import React from 'react';
import { renderApp } from '@common/components/Core/renderApp';
import { commonText } from '@common/localization/commonText';
import { StatsJson } from '../Stats/computeStats';
import { App } from './App';

const container = document.createElement('main');

container.classList.add(
  'flex',
  'flex-col',
  'gap-4',
  'h-full',
  'overflow-auto',
  'dark:bg-neutral-800',
  'dark:text-gray-100',
  'min-h-screen',
  'p-4',
);

document.body.append(container);
document.title = commonText.textHoarder;

if (!('stats' in window) || typeof window.stats !== 'object')
  throw new Error('Stats not found');

const stats = window.stats as StatsJson;

renderApp(container, <App stats={stats} />);
