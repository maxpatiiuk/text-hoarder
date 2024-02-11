import { R, RA } from '@common/utils/types';
import { Article } from './gatherArticles';
import { cliText } from '@common/localization/cliText';
import { encoding } from '@common/utils/encoding';
import { multiSortFunction } from '@common/utils/utils';
import stopWords from './stopWords.json';
import { getLanguage } from '@common/localization/utils';

/*
 * From https://www.ranks.nl/stopwords (i.e the unofficial Google dataset)
 */
const stopWordsSet = new Set(stopWords);

export type StatsJson = {
  readonly allStats: StatsStructure;
  readonly perTag: R<StatsStructure>;
  readonly perYear: R<StatsStructure>;
};

export type StatsStructure = {
  readonly counts: StatsCounts;
  readonly perDay: R<StatsCounts>;
  readonly perHost: R<StatsCounts>;
  readonly topWords: R<number>;
};

const uniqueWords = new WeakMap<StatsCounts, Set<string>>();

export type StatsCounts = {
  count: number;
  length: number;
  words: number;
  sentences: number;
  paragraphs: number;
  uniqueWords: number;
};

export function computeStats(
  articles: RA<Article>,
  includeTags: boolean,
  preciseStats: boolean,
): StatsJson {
  console.log(cliText.statsCommandProgress);
  const total = articles.length * 2;
  const reportProgress = (index: number) =>
    console.log(`${Math.round(((index / total) * 10_000) / 100)}%`);
  const extractWords = preciseStats ? extractWordsSegmenter : extractWordsRegex;
  const computed = articles.map((article, index) => {
    if (index % 400 === 0) reportProgress(index);
    const fullContent = `${article.title}.\n${article.content}`;
    const words = extractWords(article.content.toLowerCase());
    return {
      article: { ...article, host: new URL(article.url).host },
      words,
      counts: articleToCounts(fullContent, words, preciseStats),
    };
  });

  const statsJson: StatsJson = {
    allStats: initializeStatsStructure(),
    perTag: {},
    perYear: {},
  };
  computed.forEach(({ article, words, counts }, index) => {
    if (index % 400 === 0) reportProgress(articles.length + index);
    const year = article.date.getFullYear();
    const tag = article.tag ?? cliText.untagged;

    if (includeTags) statsJson.perTag[tag] ??= initializeStatsStructure();
    statsJson.perYear[year] ??= initializeStatsStructure();

    mergeStatsStructure(statsJson.allStats, article, counts, words);
    if (includeTags)
      mergeStatsStructure(statsJson.perTag[tag], article, counts, words);
    mergeStatsStructure(statsJson.perYear[year], article, counts, words);
  });

  return pickTop(statsJson);
}

const wordSegmenter =
  'Segmenter' in Intl
    ? new Intl.Segmenter(getLanguage(), {
        granularity: 'word',
      })
    : undefined;
const reWord =
  /[\p{Letter}\p{Number}\p{Dash_Punctuation}\p{Connector_Punctuation}']+/gu;
const extractWordsRegex = (text: string): RA<string> =>
  text.match(reWord) ?? [];
const extractWordsSegmenter =
  wordSegmenter === undefined
    ? extractWordsRegex
    : (text: string): RA<string> => {
        // Not using Array.from/filter/map due to out-of-memory errors
        let words = [];
        for (const { segment, isWordLike } of wordSegmenter.segment(text))
          if (isWordLike) words.push(segment);
        return words;
      };

function articleToCounts(
  content: string,
  words: RA<string>,
  preciseStats: boolean,
): StatsCounts {
  const wordsSet = new Set(words);
  const countSentences = preciseStats
    ? countSentencesSegmenter
    : countSentencesRegex;
  const counts = {
    count: 1,
    length: content.length,
    words: words.length,
    sentences: countSentences(content),
    paragraphs: content.split(/\n+/).length,
    uniqueWords: wordsSet.size,
  };
  uniqueWords.set(counts, wordsSet);
  return counts;
}

const sentenceSegmenter =
  'Segmenter' in Intl
    ? new Intl.Segmenter(getLanguage(), {
        granularity: 'sentence',
      })
    : undefined;
// Inspired by wordcounter.net, but modified to handle non-English languages and less common sentence-ending punctuation
const reSentence =
  /[^.!?…⁇‼‽⁈⁉⸮]+(?:[.!?…⁇‼‽⁈⁉⸮](?!['"]?|$)[^.!?…⁇‼‽⁈⁉⸮]*)*[.!?…⁇‼‽⁈⁉⸮]?['"]?(?=|$)(?:[.!?…⁇‼‽⁈⁉⸮]\s+[\p{Lu}\p{Lt}])/gu;
const countSentencesRegex = (content: string): number =>
  content.length === 0 ? 0 : content.split(reSentence).length + 1;
const countSentencesSegmenter =
  sentenceSegmenter === undefined
    ? countSentencesRegex
    : (content: string): number => {
        // Not using Array.from due to out-of-memory errors
        let count = 0;
        for (const { segment } of sentenceSegmenter.segment(content))
          if (segment.trimEnd().length > 0) count += 1;
        return count;
      };

const initializeStatsStructure = (): StatsStructure => ({
  counts: initializeCounts(),
  perDay: {},
  perHost: {},
  topWords: {},
});

function initializeCounts(): StatsCounts {
  const counts = {
    count: 0,
    length: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    uniqueWords: 0,
  };
  uniqueWords.set(counts, new Set());
  return counts;
}

function mergeStatsStructure(
  structure: StatsStructure,
  article: Article & { readonly host: string },
  counts: StatsCounts,
  words: RA<string>,
): void {
  const day = encoding.date.encode(article.date);
  const fullHost = article.host;
  const host = fullHost.startsWith('www.')
    ? fullHost.slice('www.'.length)
    : fullHost;

  structure.perDay[day] ??= initializeCounts();
  structure.perHost[host] ??= initializeCounts();

  words.forEach((word) => {
    structure.topWords[word] ??= 0;
    structure.topWords[word] += 1;
  });

  mergeCounts(structure.counts, counts);
  mergeCounts(structure.perDay[day], counts);
  mergeCounts(structure.perHost[host], counts);
}

function mergeCounts(totalCounts: StatsCounts, newCounts: StatsCounts) {
  totalCounts.count += newCounts.count;
  totalCounts.length += newCounts.length;
  totalCounts.words += newCounts.words;
  totalCounts.sentences += newCounts.sentences;
  totalCounts.paragraphs += newCounts.paragraphs;
  totalCounts.uniqueWords += newCounts.uniqueWords;
  const totalUniqueWords = uniqueWords.get(totalCounts)!;
  const newUniqueWords = uniqueWords.get(newCounts)!;
  Array.from(newUniqueWords).forEach((word) => totalUniqueWords.add(word));
}

const pickTop = (stats: StatsJson): StatsJson => ({
  allStats: pickTopFromStatsStructure(stats.allStats),
  perTag: Object.fromEntries(
    Object.entries(stats.perTag).map(([tag, statsStructure]) => [
      tag,
      pickTopFromStatsStructure(statsStructure),
    ]),
  ),
  perYear: Object.fromEntries(
    Object.entries(stats.perYear).map(([year, statsStructure]) => [
      year,
      pickTopFromStatsStructure(statsStructure),
    ]),
  ),
});

const topCount = 1000;
const reNumber = /^\d+$/;
const pickTopFromStatsStructure = (
  statsStructure: StatsStructure,
): StatsStructure => ({
  ...statsStructure,
  perHost: Object.fromEntries(
    Object.entries(statsStructure.perHost)
      .sort(
        multiSortFunction(
          ([_, { count }]) => count,
          true,
          ([host]) => host,
        ),
      )
      .slice(0, topCount),
  ),
  topWords: Object.fromEntries(
    Object.entries(statsStructure.topWords)
      .filter(([word]) => !stopWordsSet.has(word) && word.length > 1)
      .sort(
        multiSortFunction(
          ([_, count]) => count,
          true,
          ([word]) => word,
        ),
      )
      .slice(0, topCount)
      /*
       * If key is a number, add a space to prevent EcmaScript from
       * reordering it (the spec forces all numeric keys to go first)
       */
      .map(([word, count]) => [reNumber.test(word) ? `${word} ` : word, count]),
  ),
});
