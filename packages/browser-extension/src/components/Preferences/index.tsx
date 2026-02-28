/**
 * This scrip is called from the preferences page
 */

import mainCss from '@common/css/main.css?inline';
import { collectStyle } from '../Core/styleLoader';
import React from 'react';
import { preferencesText } from '@common/localization/preferencesText';
import { Preferences } from './Preferences';
import { renderStandalonePage } from '../Core/StandalonePage';

collectStyle(mainCss);
renderStandalonePage(preferencesText.preferences, 'narrow', <Preferences />);
