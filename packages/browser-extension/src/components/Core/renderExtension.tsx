import React from 'react';
import { renderApp } from '@common/components/Core/renderApp';
import { loadingGif } from '@common/hooks/useLoading';
import { Contexts } from '../Contexts/Contexts';
import { ApplyTheme } from './ApplyTheme';
import { getStyleTags } from './styleLoader';

export function renderExtension(
  container: HTMLElement,
  children: JSX.Element,
  stylesContainer: ParentNode,
): () => void {
  stylesContainer.append(...getStyleTags());

  return renderApp(
    container,
    <React.Suspense fallback={loadingGif}>
      <Contexts>
        <ApplyTheme container={container} />
        {children}
      </Contexts>
    </React.Suspense>,
  );
}
