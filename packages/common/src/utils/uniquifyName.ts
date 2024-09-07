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
  /**
   * For ensuring natural sort order when sorting by ascii
   */
  padLength = 0,
  isRecursiveCall = false,
): string {
  if ((isRecursiveCall || padLength === 0) && !usedNames.includes(name))
    return name.length < maxLength
      ? name
      : getUniqueName(
          name.slice(0, maxLength - 1),
          usedNames,
          maxLength,
          type,
          padLength,
          true,
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
  const currentIndex = f.parseInt(indexString) ?? 0;
  const indexes = usedNames
    .map((name) => f.parseInt(indexRegex.exec(name)?.[1]) ?? 0)
    .filter(isDefined);
  const highestExistingIndex = Math.max(0, ...indexes);
  // If current entry is already highest index, don't increment it
  const newIndex =
    currentIndex > highestExistingIndex
      ? currentIndex
      : highestExistingIndex + 1;
  const paddedNewIndex =
    padLength === 0 ? newIndex : newIndex.toString().padStart(padLength, '0');
  const uniquePart = `${prefix}${paddedNewIndex}${suffix}`;
  const newName =
    padLength === 0 && newIndex === 1 && length === 0
      ? strippedName
      : `${strippedName}${uniquePart}`;

  // Handle new name being over length limit
  const finalName =
    newName.length > maxLength
      ? name.slice(0, -1 * uniquePart.length)
      : newName;

  // Call itself again just in case the new name is also used
  return finalName === name
    ? name
    : getUniqueName(finalName, usedNames, maxLength, type, padLength, true);
}
