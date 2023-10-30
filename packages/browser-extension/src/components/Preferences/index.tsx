/**
 * This scrip is called from the preferences page
 */

import { renderApp } from '../Core/renderApp';
import React from 'react';
import { preferencesText } from '../../localization/preferencesText';
import { Preferences } from './Preferences';
import { IsPreferencesStandalone } from './Context';
import { usePageStyle } from './usePageStyle';

const container = document.createElement('div');

container.classList.add(
  'flex',
  'items-center',
  'justify-center',
  'h-full',
  'overflow-auto',
  'dark:bg-neutral-800',
  'dark:text-gray-100',
  'min-h-screen',
);

document.body.append(container);
document.title = preferencesText.preferences;

renderApp(container, <PreferencesPage />, document.body);

function PreferencesPage(): JSX.Element {
  const { style, customCss } = usePageStyle();
  return (
    <IsPreferencesStandalone.Provider value>
      <div
        className="flex flex-col gap-4 p-4 max-w-[40rem]"
        style={{
          ...style,
          fontFamily:
            style.fontFamily === 'sans-serif'
              ? /* default */ undefined
              : style.fontFamily,
        }}
      >
        <Preferences />
      </div>
      {customCss}
    </IsPreferencesStandalone.Provider>
  );
}
