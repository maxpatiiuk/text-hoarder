/**
 * This scrip is called from the preferences page
 */

import React from 'react';
import { preferencesText } from '@common/localization/preferencesText';
import { Preferences } from './Preferences';
import { renderStandalonePage } from '../Core/StandalonePage';

renderStandalonePage(preferencesText.preferences, 'narrow', <Preferences />);
