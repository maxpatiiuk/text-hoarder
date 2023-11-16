import { IR, RR, RA } from '../utils/types';
import { mappedFind } from '../utils/utils';

const languages = ['en'] as const;
let language: Language = 'en';

type Language = (typeof languages)[number];
let detectedLanguage = false;

export const getLanguage = (): Language =>
  detectedLanguage ? language : resolveLanguage();

function resolveLanguage(): Language {
  const parsedLanguage = mappedFind(
    globalThis.navigator?.languages ?? [],
    (userLanguage) =>
      languages.find(
        (appLanguage) =>
          userLanguage.startsWith(appLanguage) ||
          appLanguage.startsWith(userLanguage),
      ),
  );

  detectedLanguage = true;
  language = parsedLanguage ?? language;
  return language;
}

/**
 * A tiny localization library
 *
 * Inspired by the one I wrote in
 * https://github.com/specify/specify7/blob/production/specifyweb/frontend/js_src/lib/localization/utils/index.tsx
 */
export const dictionary = <
  T extends IR<
    RR<
      Language,
      string | JSX.Element | ((...args: RA<never>) => string | JSX.Element)
    >
  >,
>(
  dictionary: T,
): {
  readonly [KEY in keyof T]: T[KEY][Language];
} =>
  new Proxy(
    {} as {
      readonly [KEY in keyof T]: T[KEY][Language];
    },
    {
      get: (target, key) =>
        typeof key === 'string'
          ? dictionary[key]?.[getLanguage()] ?? target[key]
          : undefined,
    },
  );
