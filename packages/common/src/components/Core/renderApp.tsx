import '../../css/main.css';
import { getStyleTags } from './styleLoader';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { loadingGif } from '../../hooks/useLoading';

export function renderApp(
  container: HTMLElement,
  children: JSX.Element,
  stylesContainer: ParentNode,
): () => void {
  stylesContainer.append(...getStyleTags());

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <React.Suspense fallback={loadingGif}>{children}</React.Suspense>
    </React.StrictMode>,
  );
  return (): void => root.unmount();
}
