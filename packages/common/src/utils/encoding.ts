export const savedFileExtension = '.md';
const reSavedFileExtension = /\.md$/;

export const encoding = {
  fileContent: {
    encode(text: string): string {
      const bytes = new TextEncoder().encode(text);
      const binString = String.fromCodePoint(...bytes);
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
  urlToPath: {
    encode: (year: number, url: URL): string =>
      [
        year,
        url.host,
        ...encoding.fileName
          .encode(`${url.pathname.slice(1)}${savedFileExtension}`)
          .split('/'),
      ].join('/'),
    decode: (path: string): readonly [year: number, url: URL] => {
      const [year, host, ...pathname] = path
        .replace(reSavedFileExtension, '')
        .split('/');
      return [
        Number.parseInt(year),
        new URL(
          encoding.fileName.decode(pathname.join('/')),
          `https://${host}`,
        ),
      ];
    },
  },
  date: {
    encode: (date: Date) =>
      [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ].join('-'),
    decode: (date: string) => new Date(date),
  },
};

// These characters are not allowed in Windows file names, so %-encode them
const unsafeCharacters = ['<', '>', ':', '"', '\\', '|', '*'];
const encodedUnsafeCharacters = unsafeCharacters.map((r) =>
  r === '*' ? '%2A' : encodeURIComponent(r),
);