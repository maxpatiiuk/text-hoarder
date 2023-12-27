import fs from 'node:fs';
import { initializeCommand } from '../Cli/initializeCommand';
import { Article, gatherArticles } from '../Stats/gatherArticles';
import { FilesWithTags, tagsToFileMeta } from '../Stats/getFileTags';
import { IR, R, RA, isDefined } from '@common/utils/types';
import { encoding, savedFileExtension } from '@common/utils/encoding';
import { JSDOM } from 'jsdom';
import { documentToSimpleDocument } from '../../../../browser-extension/src/components/ExtractContent/documentToSimpleDocument';
import { simpleDocumentToMarkdown } from '../../../../browser-extension/src/components/ExtractContent/simpleDocumentToMarkdown';
import 'jsdom-global/register';
import { markdownToText } from '../../../../browser-extension/src/components/ExtractContent/markdownToText';
import { multiSortFunction, sortFunction } from '@common/utils/utils';
import { f } from '@common/utils/functools';
import path from 'node:path';
import { execSync } from 'node:child_process';

global.DOMParser = window.DOMParser;

const cwd = '/Users/maxpatiiuk/site/javascript/text-hoarder-store-old';

// const order = ['url','tag','date','title','content'];

async function getArticles() {
  const { git, tags } = await initializeCommand(cwd, false);

  const filesWithTags = await tagsToFileMeta(tags, git);
  return (await gatherArticles(cwd, filesWithTags)).map(
    ({ year, ...article }) => ({
      url: article.url,
      date: article.date,
      tag: article.tag,
      title: article.title,
      content: article.content,
    }),
  );
}

const writeArticles = async (articles = getArticles()) =>
  fs.writeFileSync('articles.json', JSON.stringify(await articles, null, 1));

const readArticles = () =>
  JSON.parse(fs.readFileSync('articles.json').toString());

const articleSeparator = '\n\n-----\n\n';
const partSeparator = '\n----\n';

async function writeTextArticles(articlesPromise = getArticles(), splits = 20) {
  const articles = await articlesPromise;
  const count = Math.ceil(articles.length / splits);
  Array.from({ length: splits }).forEach((_, i) =>
    fs.writeFileSync(
      splits === 1 ? 'articles.txt' : `split/articles${i}.txt`,
      articles
        .slice(i * count, (i + 1) * count)
        .map(
          (article) =>
            `${article.url}\n${article.date.toJSON?.() ?? article.date}${
              article.tag === undefined ? '' : `\n${article.tag}`
            }${partSeparator}${article.title}\n\n${article.content}`,
        )
        .join(articleSeparator),
    ),
  );
}

const readTextArticles = (splits = 20): RA<Omit<Article, 'year'>> =>
  Array.from({ length: splits })
    .flatMap((_, i) =>
      fs
        .readFileSync(splits === 1 ? 'articles.txt' : `split/articles${i}.txt`)
        .toString()
        .split(articleSeparator),
    )
    .map((article) => {
      const [meta, text] = article.split(partSeparator);
      const [url, date, tag] = meta.split('\n');
      const [title, ...content] = text.split('\n');
      return {
        url,
        date: new Date(date),
        tag: tag || undefined,
        title,
        content: content.join('\n').slice(1),
      };
    });

const listFiles = () =>
  fs
    .readdirSync(cwd, { recursive: true })
    .filter(
      (file) =>
        file.startsWith('2') && (file.endsWith('.txt') || file.endsWith('.md')),
    );

const writeFiles = (files = listFiles()) =>
  fs.writeFileSync('files.txt', files.join('\n'));

const countTags = async (articles = getArticles()) =>
  (await articles).reduce<R<number>>((total, { tag = 'undefined' }) => {
    total[tag] ??= 0;
    total[tag] += 1;
    return total;
  }, {});

// FIXME: detect duplicates
async function gatherUrls() {
  const { git, tags } = await initializeCommand(cwd, false);

  return Object.keys(await tagsToFileMeta(tags, git)).map(
    (fileName) => encoding.urlToPath.decode(fileName)[1],
    // encoding.urlToPath.decode(
    // encoding.urlToPath.encode(...encoding.urlToPath.decode(fileName)),
    // )[1],
  );
}
const writeUrls = async (urls = gatherUrls()) =>
  fs.writeFileSync('urls3.txt', (await urls).join('\n'));

const pageToMarkdown = (
  url: string,
): Promise<
  | {
      readonly responseSize: number;
      readonly markdown: string;
    }
  | undefined
> =>
  fetch(url, {
    headers: new Headers({
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9,uk;q=0.8',
      'cache-control': 'max-age=0',
      priority: 'u=0, i',
      'sec-ch-ua':
        '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    }),
  })
    .then(async (response) => {
      const text = await response.text();
      const responseSize =
        f.parseInt(response.headers.get('content-length') ?? undefined) ??
        text.length;
      const document = new JSDOM(text);
      const simpleDocument = documentToSimpleDocument(document.window.document);
      return simpleDocument === undefined
        ? undefined
        : {
            responseSize,
            markdown: simpleDocumentToMarkdown(simpleDocument),
          };
    })
    .catch((error) => {
      console.log(error);
      return undefined;
    });

/** Run at most as many concurrent workers as there are CPU cores */
function schedulePromise<T>(callback: () => Promise<T>): Promise<T> {
  if (running.size < concurrency) {
    const promise = callback();
    running.add(promise);
    return promise.finally(() => {
      running.delete(promise);
      const next = queue.shift();
      if (typeof next === 'function') schedulePromise(next);
    });
  } else
    return new Promise((resolve, reject) =>
      queue.push(() => callback().then(resolve, reject)),
    );
}

const concurrency = 10;
const running = new Set();
const queue: Array<() => Promise<void>> = [];

function shuffleArray<T>(rawArray: RA<T>): RA<T> {
  const array = Array.from(rawArray);
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// After this index, articles are markdown
const lastLegacyFileIndex = 6402;

async function fetcher() {
  const newText = readTextArticles();
  const articles = newText.slice(
    4801,
    Math.min(lastLegacyFileIndex, lastLegacyFileIndex),
    // Math.floor(lastLegacyFileIndex / 2),
    // Math.floor(lastLegacyFileIndex / 1),
  );
  const urls = articles.map(({ url }) => url);

  // Shuffle the array so that several requests in bulk aren't made to the same
  // same domain (as many articles are for the same domain in order)
  const shuffled = shuffleArray(articles);

  let totalResponseSize = 0;
  let failedCount = 0;
  let successCount = 0;
  let ambiguousCount = 0;

  const promises = shuffled.map((article, index) =>
    schedulePromise(async () => {
      // if (
      // !article.url.includes('ne-figure-promises-at-top-ai-researchers') &&
      // !article.url.includes('enue-expected-to-double-soaring-t')
      // )
      // return article;

      const { responseSize, markdown } =
        (await pageToMarkdown(article.url)) ?? {};
      console.log(`[${index + 1} / ${articles.length}] ${article.url}`);
      totalResponseSize += responseSize ?? 0;
      if (markdown === undefined) {
        failedCount += 1;
        console.error('Failed to extract from ' + article.url);
        return article;
      }

      const [newRawTitle, ...rest] = markdown.split('\n');
      const newTitle = newRawTitle.slice(2);
      const newContent = rest.join('\n').trim();

      const markdownAsText = markdownToText(markdown);
      const similarity = computeSimilarity(
        markdownAsText,
        `${article.title}\n\n${article.content}`,
      );

      // console.log('🟥🟥');
      // console.log(`${article.title}\n\n${article.content}`);
      // console.log('🟩');
      // console.log(markdown);
      // console.log('Similarity: ', similarity);

      const isFailed = similarity < 0.3;
      if (isFailed) failedCount += 1;

      const isSuccess = similarity > 0.7;
      if (isSuccess) successCount += 1;

      if (!isFailed && !isSuccess) ambiguousCount += 1;

      return isFailed
        ? article
        : isSuccess
          ? {
              ...article,
              title: newTitle,
              content: newContent,
            }
          : {
              ...article,
              similarity,
              newTitle,
              newContent,
            };
    }),
  );

  const newArticles = await Promise.all(promises);
  // Restore original order of articles
  const restoredOrder = Array.from(newArticles).sort(
    sortFunction(({ url }) => urls.indexOf(url)),
  );

  console.log(
    `Total network fetched: ${Math.round(totalResponseSize / 1024) / 1024} MB`,
    `Failed: ${failedCount}`,
    `Ambiguous: ${ambiguousCount}`,
    `Success: ${successCount}`,
  );

  fs.writeFileSync(
    'articles.refetched.6.json',
    JSON.stringify(restoredOrder, null, 1),
  );
}

function computeSimilarity(left: string, right: string): number {
  debugger;
  const leftTokens = toTokens(left);
  const rightTokens = toTokens(right);
  const leftAdditions = countAdditions(leftTokens, rightTokens);
  // The new Reader view is able to better extract content, so it may extract more
  // Thus, discount the difference
  const rightAdditions = countAdditions(rightTokens, leftTokens) / 2;
  const similarity =
    1 -
    (leftAdditions + rightAdditions) / (leftTokens.length + rightTokens.length);
  console.log(
    `LeftAdditions: ${leftAdditions}. RightAdditions: ${rightAdditions}. Similarity: ${similarity}`,
  );
  return similarity;
}
const reWord = /[\w-]+/gu;
const toTokens = (string: string): RA<string> => string.match(reWord) ?? [];
function countAdditions(
  leftTokens: RA<string>,
  rightTokens: RA<string>,
): number {
  const leftCopy = [...leftTokens];
  let missing = 0;
  rightTokens.forEach((token) => {
    const index = leftCopy.indexOf(token);
    if (index === -1) missing += 1;
    else leftCopy[0] = '';
  });
  return missing;
}

async function logFirstMdFile() {
  const { git, tags } = await initializeCommand(cwd, false);
  const filesWithTags = await tagsToFileMeta(tags, git);
  const keys = Object.keys(filesWithTags);
  console.log(keys.slice(6401, 6402));
  fs.writeFileSync('test.txt', Object.keys(filesWithTags).join('\n'));
}

function bulkUpdateFetched() {
  const files = [
    'articles.refetched.1.json',
    'articles.refetched.2.json',
    'articles.refetched.3.json',
    'articles.refetched.4.json',
    'articles.refetched.5.json',
    'articles.refetched.6.json',
  ];
  files.forEach((file) => {
    const content = JSON.parse(fs.readFileSync(file).toString());
    const newContent = content.map(
      ({
        url,
        date,
        tag,
        title,
        newTitle,
        content,
        similarity,
        newContent,
      }) => {
        return {
          url,
          date,
          tag,
          title,
          newTitle,
          content,
          similarity: newTitle === undefined ? undefined : similarity,
          newContent:
            newContent !== undefined &&
            content.length > newContent.length * 1.25
              ? undefined
              : newContent,
        };
      },
    );
    fs.writeFileSync(`new.${file}`, JSON.stringify(newContent, null, 1));
  });
}

export const gatherMarkdownArticles = async (
  cwd: string,
  filesWithTags: FilesWithTags,
): Promise<RA<Article>> =>
  Promise.all(
    Object.entries(filesWithTags).map(async ([fileName, { date, tag }]) => {
      const localPath = path.join(cwd, fileName);
      const [year, url] = encoding.urlToPath.decode(fileName);
      try {
        const fileContent = fs.readFileSync(localPath).toString();
        const isMarkdown = localPath.endsWith(savedFileExtension);
        if (!isMarkdown) return undefined;

        const [newRawTitle, ...rest] = fileContent.trim().split('\n');
        const title = newRawTitle.slice(2);
        const content = rest.join('\n').trim();

        return {
          year,
          url,
          title,
          content,
          date,
          tag,
        };
      } catch (error) {
        console.error(error);
        // Happens if the file was deleted (filesWithTags includes deleted files)
        return undefined;
      }
    }),
  ).then((articles) => articles.filter(isDefined));

async function writeMarkdownified() {
  const { git, tags } = await initializeCommand(cwd, false);
  const filesWithTags = await tagsToFileMeta(tags, git);
  const articles = await gatherMarkdownArticles(cwd, filesWithTags);
  console.log(articles.length);
  fs.writeFileSync(
    './articles.newOnly.json',
    JSON.stringify(articles, null, 1),
  );
}

async function glueFinalArticles() {
  const unchangedMarkdown = JSON.parse(
    fs.readFileSync('articles.newOnly.json').toString(),
  );
  // const originalArticles = await readArticles();
  const files = [
    'new.articles.refetched.1.json',
    'new.articles.refetched.2.json',
    'new.articles.refetched.3.json',
    'new.articles.refetched.4.json',
    'new.articles.refetched.5.json',
    'new.articles.refetched.6.json',
  ];
  const articles = files.flatMap((file) =>
    JSON.parse(fs.readFileSync(file).toString()),
  );
  console.log(articles.length, unchangedMarkdown.length);
  fs.writeFileSync(
    'articles.final.json',
    JSON.stringify([...articles, ...unchangedMarkdown], null, 1),
  );
}

function commitToGit(dry = true) {
  const cwd = '/Users/maxpatiiuk/site/javascript/text-hoarder-store';
  const articles = JSON.parse(
    fs.readFileSync('articles.final.json').toString(),
  ) as RA<Article>;
  const commitMessageFile = path.join(process.cwd(), 'commitMessage.txt');

  // Gather tags:
  const tags = new Set();
  articles.forEach(({ tag }) => tags.add(tag));
  let allTags = Array.from(tags);
  console.log(allTags);

  const urls = articles.map(({ url }) => url);
  const current = new Set();
  let currentTagIndex = 0;

  const tagTimeZone: IR<number> = {
    '2021-04-02': -5,
    '2023-08-22': -7,
    '2023-11-18': -8,
  };
  let currentTimeZoneOffset = Object.values(tagTimeZone)[0];

  // let resumed = false;
  let index = 0;
  const sorted = Array.from(articles).sort(
    multiSortFunction(
      ({ tag }) => allTags.indexOf(tag),
      ({ date }) => date,
    ),
  );
  // debugger;
  for (const article of sorted) {
    index += 1;

    // Detect duplicates:
    if (current.has(article.url)) {
      console.log(article.url);
      continue;
    } else current.add(article.url);

    console.log(`[${index} / ${articles.length}]`);

    if (article.tag !== allTags[currentTagIndex]) {
      if (!dry)
        execSync(
          `git tag -a "${allTags[currentTagIndex]}" -m "${allTags[currentTagIndex]}"`,
          { cwd },
        );
      currentTagIndex += 1;
      currentTimeZoneOffset =
        tagTimeZone[article.tag ?? ''] ?? currentTimeZoneOffset;
    }
    if (article.tag !== allTags[currentTagIndex])
      throw new Error('article out of order');

    if (article.title.length > 160) console.log(article.title);

    const articleDate = new Date(article.date);
    const year = new Date(article.date).getFullYear();
    // A hacky way to make a commit in the right timezone
    articleDate.setHours(articleDate.getHours() + currentTimeZoneOffset);
    const dateString = `${articleDate.toUTCString()}${
      currentTimeZoneOffset > 0 ? '+' : '-'
    }${Math.abs(currentTimeZoneOffset).toString().padStart(2, '0')}00`;

    const filePath = path.join(
      cwd,
      encoding.urlToPath.encode(year, article.url),
    );
    const directory = path.dirname(filePath);

    if (!dry) {
      fs.mkdirSync(directory, { recursive: true });
      if (fs.existsSync(filePath)) continue;
      fs.writeFileSync(
        filePath,
        `# ${article.title.trim()}\n\n${article.content
          .split('\n')
          .map((line) => line.trimEnd())
          .join('\n')}`,
      );
      fs.writeFileSync(commitMessageFile, article.title.trim());
      execSync(`git add .`, { cwd });
      execSync(
        `git commit -F ${commitMessageFile} --date "${dateString}" --author "text-hoarder[bot] <408553+text-hoarder[bot]@users.noreply.github.com>"`,
        { cwd },
      );
    }
  }
  console.log(urls.length, new Set(urls).size);
}

// TODO: remaining tasks:
// - [x] run fetcher on all in 4 batches
//   - [x] detect and fix issues in the process
//   - [x] resolve all ambiguous cases
// - [x] glue refetched and new .md files together
// - [x] commit all of them into a new repository
//   - [x] use title as commit message

commitToGit(false);
console.log('completed');
