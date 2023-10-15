import { IR, RR, RA } from "../utils/types";
import { mappedFind } from "../utils/utils";

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
 * A tiny localization lib
 */
export const dictionary = <
  T extends IR<RR<Language, string | ((...args: RA<never>) => string)>>,
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
