import React from 'react';
import { renderExtension } from '../Core/renderExtension';
import { className } from '@common/components/Atoms/className';
import { usePageStyle } from '../Preferences/usePageStyle';

export const IsStandalonePage = React.createContext<boolean>(false);
IsStandalonePage.displayName = 'IsStandalonePage';

export function renderStandalonePage(
  title: string,
  mode: 'wide' | 'narrow',
  component: JSX.Element,
): void {
  const container = document.createElement('main');

  container.classList.add(
    'flex',
    'items-center',
    'justify-center',
    'h-full',
    'overflow-auto',
    'min-h-screen',
  );

  document.body.append(container);
  document.title = title;

  renderExtension(container, <StandalonePage />, document.body);

  function StandalonePage(): JSX.Element {
    const { style, customCss } = usePageStyle();
    return (
      <IsStandalonePage.Provider value>
        <div
          className={`flex flex-col gap-4 p-4 ${
            mode === 'narrow' ? 'max-w-[40rem]' : 'w-screen h-screen'
          } ${className.base}`}
          style={{
            ...style,
            maxWidth: mode === 'narrow' ? style.maxWidth : undefined,
            fontFamily:
              style.fontFamily === 'sans-serif'
                ? /* default */ undefined
                : style.fontFamily,
          }}
        >
          {component}
        </div>
        {customCss}
      </IsStandalonePage.Provider>
    );
  }
}
