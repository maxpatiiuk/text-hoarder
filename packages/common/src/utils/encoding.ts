export const savedFileExtension = '.md';
export const legacySavedFileExtension = '.txt';

export const encoding = {
  /** More on this: https://web.dev/articles/base64-encoding */
  fileContent: {
    encode(text: string): string {
      const bytes = new TextEncoder().encode(text);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
      ).join('');
      return btoa(binString);
    },
    decode(base64: string): string {
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      return new TextDecoder().decode(bytes);
    },
  },
  fileName: {
    encode: (name: string): string =>
      unsafeCharacters.reduce(
        (name, c) =>
          name.replaceAll(
            c,
            encodedUnsafeCharacters[unsafeCharacters.indexOf(c)],
          ),
        name,
      ),
    decode: (name: string): string =>
      unsafeCharacters.reduce(
        (name, c) =>
          name.replaceAll(
            encodedUnsafeCharacters[unsafeCharacters.indexOf(c)],
            c,
          ),
        name,
      ),
  },
  /**
   * Converting URL to file path is rather tricky. Reasons:
   * - Not all characters allowed in URL are allowed in Windows file names -
   *   have to encode disallowed characters, but only encode the bare minimum to
   *   keep the file name readable
   * - URLs may contain query string or hashes - those may or may not be
   *   important - I have some heuristics here to decide if to keep them
   * - Path may not end with /.md as that would create a file without a name,
   *   which may be treated as empty file - thus stripping trailing slashes
   *   (after I done testing on many websites so confirm that this is safe in
   *   predominant majority of cases - the misses are worth the trade off with
   *   cleaner file paths)
   */
  urlToPath: {
    encode: (year: number, rawUrl: URL): string => {
      const url = new URL(rawUrl);

      /*
       * Empty path segment are not allowed in file names. Hopefully this
       * doesn't change the semantics as per the target web server. Assuming
       * here that double slash is accidental. Alternatively, would have to
       * URL-encode it (replace with %2F)
       */
      const rawPathname = url.pathname.replaceAll(/\/{2,}/g, '/');
      // Remove leading slash
      const pathname = decodeURIComponent(rawPathname.slice(1));

      /**
       * For some URLs, query string is significant and thus shouldn't be removed
       *
       * If after removing likely-insignificant query string arguments, a single
       * query string argument remains, and the URL path is short (defined as
       * containing none of the following characters: "/", "_", "-", " "), then
       * preserve the query string.
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
      Array.from(url.searchParams.entries()).forEach(([key, value]) => {
        const keep = filterQueryString(key, value);
        if (!keep) url.searchParams.delete(key);
      });
      const keepQueryString =
        url.searchParams.size > 0 &&
        url.searchParams.size <= 4 &&
        !isUrlPartComplicated(
          pathname.endsWith('/') ? pathname.slice(0, -1) : pathname,
        );
      if (!keepQueryString) url.search = '';

      /*
       * Gmail uses URLs like
       * https://mail.google.com/mail/u/0/#label/Backlog%2FDeep/FMfcgzGwHfwGdcMxdmZzqQXKZHlPRrQd,
       * thus hash is important.
       * Zenhub and StoryBook does too. In all cases, hash includes
       * a slash.
       * Hoping that in other cases it's safe to remove it (or at least
       * the trade off with cleaner file names is worth the occasional
       * misses)
       */
      if (!url.hash.includes('/')) url.hash = '';

      const compiled = `${pathname}${url.search}${url.hash}`;
      const compiledWithoutSlash = compiled.endsWith('/')
        ? compiled.slice(0, -1)
        : compiled;

      /*
       * Make every URL have at least some pathname to not have any markdown
       * files outside the folder for a given domain
       */
      const separator = compiledWithoutSlash === '' ? '?' : '';

      return [
        year,
        url.host,
        ...encoding.fileName
          .encode(`${compiledWithoutSlash}${separator}${savedFileExtension}`)
          .split('/'),
      ].join('/');
    },
    decode: (rawPath: string): readonly [year: number, url: URL] => {
      // Trim file extension
      const path = rawPath.endsWith(savedFileExtension)
        ? rawPath.slice(0, -savedFileExtension.length)
        : rawPath.endsWith(legacySavedFileExtension)
          ? rawPath.slice(0, -legacySavedFileExtension.length)
          : rawPath;

      const [year, host, ...pathname] = path.split('/');

      const urlString = encoding.fileName.decode(pathname.join('/'));
      const url = new URL(urlString, `https://${host}`);

      /*
       * If href ends with ?, url.search would falsely be empty string. By
       * force-setting search string again, ? is removed from the href
       */
      if (url.search === '') url.search = '';

      return [Number.parseInt(year), url];
    },
  },
  date: {
    encode: (date: Date) =>
      [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ].join('-'),
    decode: (date: string) => {
      const [year, month, day] = date
        .split('-')
        .map((value) => Number.parseInt(value));
      return new Date(year, month - 1, day);
    },
  },
};

export const isUrlPartComplicated = (part: string) =>
  part.split(/[\/_ -]+/gu).length >= 3;

// FIXME: try out creating files from very long URLs

/*
 * These  characters are not allowed in Windows file names, so %-encode them.
 * See https://stackoverflow.com/a/31976060/8584605
 */
const unsafeCharacters = ['#', '<', '>', ':', '"', '\\', '|', '?', '*'];
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
function filterQueryString(rawName: string, value: string): boolean {
  const name = rawName.toLowerCase();
  const allowedName =
    excludeIncludesNames.every((exclude) => !name.includes(exclude)) &&
    excludeStartsNames.every((exclude) => !name.startsWith(exclude));
  if (!allowedName) return false;

  if (value.length > 100) return false;

  return true;
}

export const exportsForTests = {
  filterQueryString,
};
