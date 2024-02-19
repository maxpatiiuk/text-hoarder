/**
 * Collection of various helper methods
 *
 * @module
 */
import { isDefined } from './types';
import type { RA } from './types';

/** Generate a sort function for Array.prototype.sort */
export const sortFunction =
  <T, V extends boolean | number | string | null | undefined>(
    mapper: (value: T) => V,
    reverse = false,
  ): ((left: T, right: T) => -1 | 0 | 1) =>
  (left: T, right: T): -1 | 0 | 1 => {
    const [leftValue, rightValue] = reverse
      ? [mapper(right), mapper(left)]
      : [mapper(left), mapper(right)];
    if (leftValue === rightValue) return 0;
    else if (typeof leftValue === 'string' && typeof rightValue === 'string')
      return leftValue.localeCompare(rightValue) as -1 | 0 | 1;
    // Treat null and undefined as the same
    // eslint-disable-next-line eqeqeq
    else if (leftValue == rightValue) return 0;
    return (leftValue ?? '') > (rightValue ?? '') ? 1 : -1;
  };

/** Like sortFunction, but can sort based on multiple fields */
export const multiSortFunction =
  <ORIGINAL_TYPE>(
    ...payload: readonly (
      | true
      | ((value: ORIGINAL_TYPE) => Date | boolean | number | string)
    )[]
  ): ((left: ORIGINAL_TYPE, right: ORIGINAL_TYPE) => -1 | 0 | 1) =>
  (left: ORIGINAL_TYPE, right: ORIGINAL_TYPE): -1 | 0 | 1 => {
    const mappers = payload
      .map((value, index) =>
        typeof value === 'function'
          ? ([
              value,
              typeof payload[index + 1] === 'boolean'
                ? (payload[index + 1] as boolean)
                : false,
            ] as const)
          : undefined,
      )
      .filter(isDefined);

    for (const [mapper, isReverse] of mappers) {
      const [leftValue, rightValue] = isReverse
        ? [mapper(right), mapper(left)]
        : [mapper(left), mapper(right)];
      if (leftValue === rightValue) continue;
      return typeof leftValue === 'string' && typeof rightValue === 'string'
        ? (leftValue.localeCompare(rightValue) as -1 | 0 | 1)
        : leftValue > rightValue
          ? 1
          : -1;
    }
    return 0;
  };

/** Split array in half according to a discriminator function */
export const split = <LEFT_ITEM, RIGHT_ITEM = LEFT_ITEM>(
  array: RA<LEFT_ITEM | RIGHT_ITEM>,
  // If returns true, item would go to the right array
  discriminator: (
    item: LEFT_ITEM | RIGHT_ITEM,
    index: number,
    array: RA<LEFT_ITEM | RIGHT_ITEM>,
  ) => boolean,
): readonly [left: RA<LEFT_ITEM>, right: RA<RIGHT_ITEM>] =>
  array
    .map((item, index) => [item, discriminator(item, index, array)] as const)
    .reduce<
      readonly [
        left: RA<LEFT_ITEM | RIGHT_ITEM>,
        right: RA<LEFT_ITEM | RIGHT_ITEM>,
      ]
    >(
      ([left, right], [item, isRight]) => [
        [...left, ...(isRight ? [] : [item])],
        [...right, ...(isRight ? [item] : [])],
      ],
      [[], []],
    ) as readonly [left: RA<LEFT_ITEM>, right: RA<RIGHT_ITEM>];

// Find a value in an array, and return it's mapped variant
export function mappedFind<ITEM, RETURN_TYPE>(
  array: RA<ITEM>,
  callback: (item: ITEM, index: number) => RETURN_TYPE | undefined,
): RETURN_TYPE | undefined {
  let value = undefined;
  array.some((item, index) => {
    value = callback(item, index);
    return value !== undefined;
  });
  return value;
}

/** Escape all characters that have special meaning in regular expressions */
export const escapeRegExp = (string: string): string =>
  string.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
