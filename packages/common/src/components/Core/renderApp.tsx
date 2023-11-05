import '../../css/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { loadingGif } from '../../hooks/useLoading';

export function renderApp(
  container: HTMLElement,
  children: JSX.Element,
): () => void {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <React.Suspense fallback={loadingGif}>{children}</React.Suspense>
    </React.StrictMode>,
  );
  return (): void => root.unmount();
}
