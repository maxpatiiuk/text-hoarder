/**
 * Localization strings for all UI components (except for preferences)
 */

import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const preferencesText = dictionary({
  preferences: { en: 'Preferences' },
  theme: { en: 'Theme' },
  system: { en: 'System' },
  light: { en: 'Light' },
  dark: { en: 'Dark' },
  allowScrollPastLastLine: { en: 'Allow scroll past last line' },
  downloadFormat: { en: 'Download format' },
  markdown: { en: 'Markdown' },
  html: { en: 'HTML' },
  text: { en: 'Text' },
  fontSize: { en: 'Font size' },
  lineHeight: { en: 'Line height' },
  pageWidth: { en: 'Page width' },
  customCss: { en: 'Custom CSS' },
  customCssPlaceholder: { en: '.markdown-body {\n  color: black;\n}' },
  fontFamily: { en: 'Font family' },
  sansSerif: { en: 'Sans-serif' },
  monospace: { en: 'Monospace' },
  serif: { en: 'Serif' },
  autoTriggerUrls: { en: 'Automatically enter reader mode for these URLs' },
  addCurrentSite: { en: 'Add (this site)' },
  addCurrentSiteWithSuffix: {
    en: (suffix: string) => `Add (this site)/${suffix}`,
  },
  missingRequiredPermissions: {
    en: `
      Unable to automatically enter reader mode on the following sites due to
      missing permissions:
    `,
  },
  giveAccessToSites: {
    en: 'Give access to these sites',
  },
  giveAccessToEverySite: {
    en: 'Give access to every site',
  },
  giveAccessInPreferences: {
    en: 'To give this access, you need to open extension options page',
  },
  openPreferences: {
    en: 'Open preferences',
  },
  unfocusedMenuOpacity: {
    en: 'Menu opacity when not in use',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
