import { R, RA } from '@common/utils/types';
import { Article } from './gatherArticles';
import { cliText } from '@common/localization/cliText';

type StatsJson = {
  readonly allStats: StatsStructure;
  readonly perTag: R<StatsStructure>;
  readonly perYear: R<StatsStructure>;
};

type StatsStructure = {
  readonly counts: Counts;
  readonly perDay: R<Counts>;
  readonly perHost: R<Counts>;
  readonly words: R<number>;
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

export function computeStats(articles: RA<Article>): StatsJson {
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

    statsJson.perTag[tag] ??= initializeStatsStructure();
    statsJson.perYear[year] ??= initializeStatsStructure();

    mergeStatsStructure(statsJson.allStats, article, counts);
    mergeStatsStructure(statsJson.perTag[tag], article, counts);
    mergeStatsStructure(statsJson.perTag[year], article, counts);
  });

  return statsJson;
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
  words: {},
});

const initializeCounts = (): Counts => ({
  count: 0,
  length: 0,
  words: 0,
  sentences: 0,
  paragraphs: 0,
  uniqueWords: 0,
});

function mergeStatsStructure(
  structure: StatsStructure,
  article: Article,
  counts: Counts,
): void {
  const day = article.date.toJSON();
  const host = article.url.host;

  structure.perDay[day] ??= initializeCounts();
  structure.perHost[host] ??= initializeCounts();

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
