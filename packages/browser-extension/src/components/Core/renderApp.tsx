import '../../css/main.css';
import { getStyleTags } from '../Core/styleLoader';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { Contexts } from '../Contexts/Contexts';
import { ApplyTheme } from './ApplyTheme';

export function renderApp(
  container: HTMLElement,
  children: JSX.Element,
  stylesContainer: ParentNode,
): () => void {
  stylesContainer.append(...getStyleTags());

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ApplyTheme container={container} />
      <Contexts>{children}</Contexts>
    </React.StrictMode>,
  );
  return (): void => root.unmount();
}
