import { escapeRegExp } from '@common/utils/utils';
import { f } from './functools';
import { isDefined, type RA } from './types';

const format = {
  title: {
    prefix: ' (',
    suffix: ')',
  },
  name: {
    prefix: '_',
    suffix: '',
  },
} as const;

export function getUniqueName(
  name: string,
  usedNames: RA<string>,
  /**
   * In the process of making the name unique, its length may increase.
   * This trims the string if needed, while still keeping it unique
   *
   * @remarks
   * Can get this number from SQL schema for a given field
   */
  maxLength: number = Number.POSITIVE_INFINITY,
  type: keyof typeof format = 'title',
  padLength = 0,
): string {
  if (!usedNames.includes(name))
    return name.length < maxLength
      ? name
      : getUniqueName(
          name.slice(0, maxLength - 1),
          usedNames,
          maxLength,
          type,
          padLength,
        );

  const { prefix, suffix } = format[type];
  const reSuffix = new RegExp(
    `${escapeRegExp(prefix)}(\\d+)${escapeRegExp(suffix)}$`,
    'u',
  );
  const matchedSuffix = reSuffix.exec(name);
  const [{ length }, indexString] = matchedSuffix ?? ([[], '0'] as const);
  const strippedName = length > 0 ? name.slice(0, -1 * length) : name;
  const indexRegex = new RegExp(
    `^${escapeRegExp(strippedName)}${reSuffix.source}`,
    'u',
  );
  const indexes = [
    indexString,
    ...usedNames.map((name) => indexRegex.exec(name)?.[1]),
  ];
  const newIndex =
    Math.max(
      ...indexes.map((string) => f.parseInt(string) ?? 1).filter(isDefined),
    ) + 1;
  // This ensures natural sort order when using wildcards in bash
  const paddedNewIndex =
    padLength === 0
      ? newIndex
      : newIndex
          .toString()
          .padStart(
            Math.max(
              padLength,
              ...indexes.map((string) => string?.length ?? 0),
            ),
            '0',
          );
  const uniquePart = `${prefix}${paddedNewIndex}${suffix}`;
  const newName =
    newIndex === 1 && length === 0
      ? strippedName
      : `${strippedName}${uniquePart}`;

  // Call itself again just in case the new name is also used
  return getUniqueName(
    // Handle new name being over length limit
    newName.length > maxLength
      ? name.slice(0, -1 * uniquePart.length)
      : newName,
    usedNames,
    maxLength,
    type,
    padLength,
  );
}
