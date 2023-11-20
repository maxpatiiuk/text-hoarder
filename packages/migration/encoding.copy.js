/** 
 * Simplified copy of https://github.com/maxxxxxdlp/text-hoarder/blob/main/packages/common/src/utils/encoding.ts
 */

export const encoding = {
  fileName: {
    encode: (name) =>
      unsafeCharacters.reduce(
        (name, c) =>
          name.replaceAll(
            c,
            encodedUnsafeCharacters[unsafeCharacters.indexOf(c)],
          ),
        name,
      ),
  },
  urlToPath: {
    encode: (year, rawUrl) => {
      const url = new URL(rawUrl);

      /**
       * For some URLs, query string is significant and thus shouldn't be removed
       *
       * If after removing likely-insignificant query string arguments, a single
       * query string argument remains, and the URL path is short (defined as
       * containing fewer than 3 of / _ - or space characters), then preserve
       * the query string.
       *
       * Examples:
       * - https://nightsky.jpl.nasa.gov/news-display.cfm?News_ID=573
       * - https://www.urbandictionary.com/define.php?term=omega%20male%2F
       * - https://arstechnica.com/civis/viewtopic.php?t=200746
       * - http://wiki.c2.com/?WhyWikiWorks
       * - https://models.com/oftheminute/?p=54874
       * - https://news.ycombinator.com/item?id=8532261
       * - https://queue.acm.org/detail.cfm?id=3595878
       * - https://www.youtube.com/watch?v=SybEhNc_VhI
       * - https://mymetlifevision.com/article.html?article=foods-to-keep-your-eyes-and-body-healthy
       *
       * And some harder examples:
       * - https://mymetlifevision.com/article.html?article=gaining-on-glaucoma-detection-and-treatment&vision-conditions-diseases
       * - https://www.youtube.com/watch?v=UuYqH6M6nmQ&list=WL&index=7
       * - https://us11.campaign-archive.com/?e=01d2b095a0&u=9d7ced8c4bbd6c2f238673f0f&id=6e71bb1932
       * - https://storybook.com/redacted/?path=/docs/references-t9n-for-components--docs
       */
      const queryString = Array.from(url.searchParams.entries()).filter(
        ([key, value]) => {
          const keep = filterQueryString(key, value);
          if (!keep) url.searchParams.delete(key);
          return keep;
        },
      );
      const keepQueryString =
        queryString.length > 0 &&
        queryString.length <= 4 &&
        url.pathname.split(/[\/_ -]/m).length < 4;

      url.hash = '';
      if (!keepQueryString) url.search = '';
      const pathname = url.pathname.slice(1);
      const searchString =
        url.search.length > 1
          ? `${
              pathname.endsWith('/') || pathname.length === 0 ? '' : '/'
            }&${url.search.slice(1)}`
          : /*
           * If URL ends with /, the resulting path would look like
           * /somep/path/.md, which creates a file without a name,
           * which would be treated as hidden on many systems. Appending
           * & is a workaround
           */
          pathname === '' || pathname.endsWith('/')
          ? '&'
          : '';

      return [
        year,
        url.host,
        ...encoding.fileName
          .encode(`${pathname}${searchString}.txt`)
          .split('/'),
      ].join('/');
    },
  }
};

// FIXME: try out creating files from very long URLs

// These characters are not allowed in Windows file names, so %-encode them
const unsafeCharacters = ['<', '>', ':', '"', '\\', '|', '*'];
const encodedUnsafeCharacters = unsafeCharacters.map((r) =>
  r === '*' ? '%2A' : encodeURIComponent(r),
);

const excludeIncludesNames = [
  'utm',
  'affiliate',
  'amp',
  'token',
  'subscriber',
  'impression',
  'campaign',
  'candidate',
  'click',
  'ref',
  'trk',
  '_url',
  'data',
  'date',
  'hash',
  'redirect',
  'user',
  'email',
  'offer',
  'lead',
  'image',
  'option',
  'provider',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ' ',
  '/',
];
const excludeStartsNames = ['_', 'at_', 'pk_', 'mc_', 'ad'];
function filterQueryString(rawName, value) {
  const name = rawName.toLowerCase();
  const allowedName =
    excludeIncludesNames.every((exclude) => !name.includes(exclude)) &&
    excludeStartsNames.every((exclude) => !name.startsWith(exclude));
  if (!allowedName) return false;

  if (value.length > 100) return false;

  return true;
}
