/**
 * This scrip is called from the preferences page
 */

import React from 'react';
import { preferencesText } from '@common/localization/preferencesText';
import { Preferences } from './Preferences';
import { IsPreferencesStandalone } from './Context';
import { usePageStyle } from './usePageStyle';
import { renderExtension } from '../Core/renderExtension';
import { className } from '@common/components/Atoms/className';

const container = document.createElement('main');

container.classList.add(
  'flex',
  'items-center',
  'justify-center',
  'h-full',
  'overflow-auto',
  'min-h-screen',
  ...className.base.split(' '),
);

document.body.append(container);
document.title = preferencesText.preferences;

renderExtension(container, <PreferencesPage />, document.body);

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
