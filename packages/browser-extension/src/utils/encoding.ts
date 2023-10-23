export const encoding = {
  fileContent: {
    encode(base64: string): string {
      const binString = atob(base64);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
      return new TextDecoder().decode(bytes);
    },
    decode(text: string): string {
      const bytes = new TextEncoder().encode(text);
      const binString = String.fromCodePoint(...bytes);
      return btoa(binString);
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
  urlToPath: {
    encode: (year: number, url: URL): string =>
      [
        year,
        url.host,
        ...encoding.fileName.encode(`${url.pathname.slice(1)}.md`).split('/'),
      ].join('/'),
    decode: (path: string): readonly [year: number, url: URL] => {
      const [year, host, ...pathname] = path.replace(/.md$/, '').split('/');
      return [
        Number.parseInt(year),
        new URL(
          encoding.fileName.decode(pathname.join('/')),
          `https://${host}`,
        ),
      ];
    },
  },
};

// These characters are not allowed in Windows file names, so %-encode them
const unsafeCharacters = ['<', '>', ':', '"', '\\', '|', '*'];
const encodedUnsafeCharacters = unsafeCharacters.map((r) =>
  r === '*' ? '%2A' : encodeURIComponent(r),
);
