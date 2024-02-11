/**
 * Localization strings used by the Stats page
 */

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

import React from 'react';
import { dictionary } from './utils';

/* eslint-disable @typescript-eslint/naming-convention */
export const statsText = dictionary({
  stats: { en: 'Stats' },
  computeRepositoryStats: { en: 'Compute repository stats' },
  statsDescription: {
    en: `
      This page computes statistics about the the articles saved in your GitHub
      repository. Want to see your most common websites? Or years when you added
      the most articles? Or most common words? See the answers here!
    `,
  },
  beginDownload: { en: 'Begin download' },
  downloading: { en: 'Downloading' },
  makeTakeSomeTime: { en: 'Note: stats computation make take several minutes' },
  statsUnsupported: {
    en: (link: (label: string) => JSX.Element): JSX.Element => (
      <>
        Your browser does not support the required features for this page.
        Please update your browser. You can also{' '}
        {link('compute the stats from the command line')}.
      </>
    ),
  },
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
