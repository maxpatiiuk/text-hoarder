/**
 * Localization strings for all UI components (except for preferences)
 */

import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const preferencesText = dictionary({
  collapseMenu: { en: 'Collapse menu' },
  expandMenu: { en: 'Expand menu' },
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
  fontWeight: { en: 'Font weight' },
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
  eagerCheckForAlreadySaved: {
    en: 'Check ahead of time if current article has already been saved (less green for the planet)',
  },
  allowBackgroundKeyboardShortcuts: {
    en: 'Allow keyboard shortcuts for saving or downloading current page to work even while extension is not open',
  },
  restoreScrollPosition: {
    en: 'Restore scroll position',
  },
  automatic: {
    en: 'Automatic',
  },
  smoothScroll: {
    en: 'Smooth Scroll',
  },
  instantScroll: {
    en: 'Instant Scroll',
  },
  dontRestoreScroll: {
    en: "Don't Restore Scroll",
  },
  undoUsingForcePush: {
    en: 'Undo using force push when possible',
  },
  includeArticleUrl: {
    en: 'Include article URL at the top of saved file',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
