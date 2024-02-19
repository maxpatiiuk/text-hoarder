/**
 * Localization strings used by the Stats page
 */

import { dictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const statsText = dictionary({
  statsNotFound: { en: 'No stats found' },
  filter: { en: 'Filter' },
  allYears: { en: 'All years' },
  years: { en: 'Years' },
  tags: { en: 'Tags' },
  counts: { en: 'Counts' },
  savedArticles: { en: 'Saved Articles' },
  totalLength: { en: 'Total length' },
  totalWords: { en: 'Total words' },
  totalSentences: { en: 'Total sentences' },
  totalParagraphs: { en: 'Total paragraphs' },
  totalUniqueWords: { en: 'Total unique words' },
  average: { en: 'Average' },
  compare: { en: 'Compare' },
  showMoreStats: { en: 'Show more stats' },
  hideMoreStats: { en: 'Hide more stats' },
  topWebsites: { en: 'Top websites' },
  website: { en: 'Website' },
  mostCommonWords: { en: 'Most common words' },
  occurrences: { en: 'Occurrences' },
  position: { en: 'Position' },
  up: { en: 'Up' },
  down: { en: 'Down' },
  word: { en: 'Word' },
  forWebsite: { en: (website: string) => `(for website: ${website})` },
  showAll: { en: 'Show all' },
});
/* eslint-enable @typescript-eslint/naming-convention */
