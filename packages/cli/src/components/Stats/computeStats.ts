import { R, RA } from '@common/utils/types';
import { Article } from './gatherArticles';
import { cliText } from '@common/localization/cliText';
import { encoding } from '@common/utils/encoding';
import { sortFunction } from '@common/utils/utils';

type StatsJson = {
  readonly allStats: StatsStructure;
  readonly perTag: R<StatsStructure>;
  readonly perYear: R<StatsStructure>;
};

type StatsStructure = {
  readonly counts: Counts;
  readonly perDay: R<Counts>;
  readonly perHost: R<Counts>;
  readonly topWords: R<number>;
};

const uniqueWords = new WeakMap<Counts, Set<String>>();

type Counts = {
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
): StatsJson {
  const computed = articles.map((article) => {
    const fullContent = `${article.title}.\n${article.content}`;
    const words = extractWords(article.content.toLowerCase());
    return { article, words, counts: articleToCounts(fullContent, words) };
  });

  const statsJson: StatsJson = {
    allStats: initializeStatsStructure(),
    perTag: {},
    perYear: {},
  };
  computed.forEach(({ article, words, counts }) => {
    const year = article.date.getFullYear();
    const tag = article.tag ?? cliText.untagged;

    if (includeTags) statsJson.perTag[tag] ??= initializeStatsStructure();
    statsJson.perYear[year] ??= initializeStatsStructure();

    mergeStatsStructure(statsJson.allStats, article, counts, words);
    if (includeTags)
      mergeStatsStructure(statsJson.perTag[tag], article, counts, words);
    mergeStatsStructure(statsJson.perYear[year], article, counts, words);
  });

  return pickTopWords(statsJson);
}

const reWord =
  /[\p{Letter}\p{Number}\p{Dash_Punctuation}\p{Connector_Punctuation}]+/gu;
const extractWords = (text: string): RA<string> => text.match(reWord) ?? [];

function articleToCounts(content: string, words: RA<string>): Counts {
  const wordsSet = new Set(words);
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

// Inspired by wordcounter.net, but modified to handle non-English languages and less common sentence-ending punctuation
const reSentence =
  /[^.۔!?¿¡…。๏⁇‼‽⁈⁉⸘⸮︖︕！？]+(?:[.۔!?¿¡…。๏⁇‼‽⁈⁉⸘⸮︖︕！？](?![\p{Pi}\p{Pf}]?|$)[^.۔!?¿¡…。๏⁇‼‽⁈⁉⸘⸮︖︕！？]*)*[.۔!?¿¡…。๏⁇‼‽⁈⁉⸘⸮︖︕！？]?[\p{Pi}\p{Pf}]?(?=|$)(?:[.۔!?¿¡…。๏⁇‼‽⁈⁉⸘⸮︖︕！？]\p{Z}+[\p{Lu}\p{Lt}])/gu;
const countSentences = (content: string): number =>
  content.length === 0 ? 0 : content.split(reSentence).length + 1;

const initializeStatsStructure = (): StatsStructure => ({
  counts: initializeCounts(),
  perDay: {},
  perHost: {},
  topWords: {},
});

function initializeCounts(): Counts {
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
  article: Article,
  counts: Counts,
  words: RA<string>,
): void {
  const day = encoding.date.encode(article.date);
  const host = article.url.host;

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

function mergeCounts(totalCounts: Counts, newCounts: Counts) {
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

const pickTopWords = (stats: StatsJson): StatsJson => ({
  allStats: pickTopWordsFromStatsStructure(stats.allStats),
  perTag: Object.fromEntries(
    Object.entries(stats.perTag).map(([tag, statsStructure]) => [
      tag,
      pickTopWordsFromStatsStructure(statsStructure),
    ]),
  ),
  perYear: Object.fromEntries(
    Object.entries(stats.perYear).map(([year, statsStructure]) => [
      year,
      pickTopWordsFromStatsStructure(statsStructure),
    ]),
  ),
});

const pickTopWordsFromStatsStructure = (
  statsStructure: StatsStructure,
): StatsStructure => ({
  ...statsStructure,
  topWords: Object.fromEntries(
    Object.entries(statsStructure.topWords)
      .sort(sortFunction(([_, count]) => count, true))
      .slice(0, 100),
  ),
});
