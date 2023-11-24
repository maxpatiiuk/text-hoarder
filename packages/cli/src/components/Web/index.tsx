/**
 * This script is called from the stats page opened by the CLI script
 */

import React from 'react';
import { renderApp } from '@common/components/Core/renderApp';
import { commonText } from '@common/localization/commonText';
import { StatsJson } from '../Stats/computeStats';
import { App } from './App';
import { className } from '@common/components/Atoms/className';

const container = document.createElement('main');

container.classList.add(
  'flex',
  'flex-col',
  'gap-4',
  'h-full',
  'overflow-auto',
  'min-h-screen',
  'p-4',
  ...className.base.split(' '),
);

document.body.append(container);
document.title = commonText.textHoarder;

if (!('stats' in window) || typeof window.stats !== 'object')
  throw new Error('Stats not found');

const stats = window.stats as StatsJson;

renderApp(container, <App stats={stats} />);
