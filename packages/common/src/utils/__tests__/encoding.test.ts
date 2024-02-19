import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { encoding, exportsForTests } from '../encoding';

const { filterQueryString } = exportsForTests;

describe('fileContent', () => {
  const from = 'Test 🤣';
  const to = 'VGVzdCDwn6Sj';
  test('encode', () => assert.equal(encoding.fileContent.encode(from), to));
  test('decode', () => assert.equal(encoding.fileContent.decode(to), from));
});

describe('fileName', () => {
  const from = 'Test 🤣 # < > : " \\ | * ? = _ –';
  const to = 'Test 🤣 %23 %3C %3E %3A %22 %5C %7C %2A %3F = _ –';
  test('encode', () => assert.equal(encoding.fileName.encode(from), to));
  test('decode', () => assert.equal(encoding.fileName.decode(to), from));
});

describe('fileTitle', () => {
  const from = 'Test 🤣 = _ – # < > : " \\ | * ?    .';
  const to = 'Test 🤣 = _ –';
  test('encode', () => assert.equal(encoding.fileTitle.encode(from), to));
});

describe('urlToPath', () => {
  const year = 2020;
  const urls = {
    'https://example.com/abc': '2020/example.com/abc.md',
    'https://en.wikipedia.org/wiki/Hershey–Chase_experiment':
      '2020/en.wikipedia.org/wiki/Hershey–Chase_experiment.md',

    // Don't preserve scheme - assume https
    'http://example.com/abc': [
      '2020/example.com/abc.md',
      'https://example.com/abc',
    ],

    // Don't allow empty path
    'https://example.com': '2020/example.com/%3F.md',

    // Don't preserve base trailing slash
    'https://example.com/': ['2020/example.com/%3F.md', 'https://example.com'],

    // Normalize slashes
    'http://example.com/abc//a///': [
      '2020/example.com/abc/a.md',
      'https://example.com/abc/a',
    ],
    'https://example.com/abc/': [
      '2020/example.com/abc.md',
      // Not preserving trailing slash
      'https://example.com/abc',
    ],

    // Discarding hash unless it contains /
    'https://example.com/abc#hash': [
      '2020/example.com/abc.md',
      'https://example.com/abc',
    ],
    'https://example.com/abc#page/url': '2020/example.com/abc%23page/url.md',
    'https://example.com/abc#page/url/': [
      '2020/example.com/abc%23page/url.md',
      // Not preserving trailing slash
      'https://example.com/abc#page/url',
    ],

    // Do not preserve query string for urls with >2 path segments
    'https://example.com/abc/a/b?a=b': [
      '2020/example.com/abc/a/b.md',
      'https://example.com/abc/a/b',
    ],
    // Can't use ? in Windows file names
    'https://example.com/abc/?a=b': '2020/example.com/abc/%3Fa=b.md',
    'https://example.com/abc?a=b': '2020/example.com/abc%3Fa=b.md',
    'https://example.com/abc?a=b/': [
      '2020/example.com/abc%3Fa=b.md',
      // Not preserving trailing slash
      'https://example.com/abc?a=b',
    ],
    // Exclude query string if has more than 3 parts
    'https://example.com/abc?a=b&b=c&c=d&d=e': [
      '2020/example.com/abc.md',
      'https://example.com/abc',
    ],
    // Exclude useless query string arguments
    'https://example.com/abc?a=b&utm_medium=email': [
      '2020/example.com/abc%3Fa=b.md',
      'https://example.com/abc?a=b',
    ],
    // Test real-world URLs with meaningful query strings:
    'https://nightsky.jpl.nasa.gov/news-display.cfm?News_ID=573':
      '2020/nightsky.jpl.nasa.gov/news-display.cfm%3FNews_ID=573.md',
    'https://www.urbandictionary.com/define.php?term=omega%20male%2F': [
      '2020/www.urbandictionary.com/define.php%3Fterm=omega male.md',
      'https://www.urbandictionary.com/define.php?term=omega male',
    ],
    'https://www.urbandictionary.com/define.php?term=omega male':
      '2020/www.urbandictionary.com/define.php%3Fterm=omega male.md',
    'https://arstechnica.com/civis/viewtopic.php?t=200746':
      '2020/arstechnica.com/civis/viewtopic.php%3Ft=200746.md',
    'https://wiki.c2.com/?WhyWikiWorks': '2020/wiki.c2.com/%3FWhyWikiWorks.md',
    'https://models.com/oftheminute/?p=54874':
      '2020/models.com/oftheminute/%3Fp=54874.md',
    'https://news.ycombinator.com/item?id=8532261':
      '2020/news.ycombinator.com/item%3Fid=8532261.md',
    'https://queue.acm.org/detail.cfm?id=3595878':
      '2020/queue.acm.org/detail.cfm%3Fid=3595878.md',
    'https://www.youtube.com/watch?v=SybEhNc_VhI':
      '2020/www.youtube.com/watch%3Fv=SybEhNc_VhI.md',
    'https://mymetlifevision.com/article.html?article=foods-to-keep-your-eyes-and-body-healthy':
      '2020/mymetlifevision.com/article.html%3Farticle=foods-to-keep-your-eyes-and-body-healthy.md',
    'https://mymetlifevision.com/article.html?article=gaining-on-glaucoma-detection-and-treatment&vision-conditions-diseases':
      '2020/mymetlifevision.com/article.html%3Farticle=gaining-on-glaucoma-detection-and-treatment&vision-conditions-diseases.md',
    'https://www.youtube.com/watch?v=UuYqH6M6nmQ&list=WL&index=7':
      '2020/www.youtube.com/watch%3Fv=UuYqH6M6nmQ&list=WL&index=7.md',
    'https://us11.campaign-archive.com/?e=01d2b095a0&u=9d7ced8c4bbd6c2f238673f0f&id=6e71bb1932':
      '2020/us11.campaign-archive.com/%3Fe=01d2b095a0&u=9d7ced8c4bbd6c2f238673f0f&id=6e71bb1932.md',
    'https://storybook.com/redacted/?path=/docs/references-t9n-for-components--docs':
      '2020/storybook.com/redacted/%3Fpath=/docs/references-t9n-for-components--docs.md',
  };

  Object.entries(urls).forEach(([url, result]) =>
    describe(url, () => {
      const path = Array.isArray(result) ? result[0] : result;
      const finalUrl = Array.isArray(result) ? result[1] : url;
      test('encode', () =>
        assert.equal(encoding.urlToPath.encode(year, url), path));
      test('decode', () => {
        const [newYear, newUrl] = encoding.urlToPath.decode(path);
        assert.equal(newYear, year);
        assert.equal(newUrl, finalUrl);
      });
    }),
  );
});

describe('date', () => {
  const date = '2020-10-01T00:00:00-00:00';
  const from = new Date(date);
  const to = '2020-10-01';
  test('encode', () => assert.equal(encoding.date.encode(from), to));
});

describe('filterQueryString', () => {
  const entries = [
    ['utm', '_', false],
    ['_a', 'a', false],
    ['at_a', 'a', false],
    ['5', '', false],
    ['email', '', false],
    ['data', 'xAI', false],
    ['date', '', false],
    ['id', '__', true],
    ['page', 'a/a', true],
    ['uuid', '__', true],
    ['long', 'x'.repeat(101), false],
  ] as const;

  entries.forEach(([key, value, include]) =>
    test(`${key}=${value} => ${include}`, () =>
      assert.equal(filterQueryString(key, value), include)),
  );
});
