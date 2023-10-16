import '../../css/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { Contexts } from '../Contexts/Contexts';
import { localization } from '../../localization/common';

const container = document.createElement('div');
container.classList.add('w-[20rem]', 'h-[600px]');
document.body.append(container);

document.title = localization.textHoarder;

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <Contexts>
      <App />
    </Contexts>
  </React.StrictMode>,
);

// FEAT: use action.setIcon/setTitle/setBadgeText/setBadgeBackgroundColor to show if there are any saved texts for this page
