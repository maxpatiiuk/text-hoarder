import type { RA } from './types';

/**
 * A collection of helper functions for functional programming style
 * Kind of like underscore or ramda, but typesafe
 */
export const f = {
  /**
   * A better typed version of Array.prototype.includes
   *
   * It allows first argument to be of any type, but if value is present
   * in the array, its type is changed using a type predicate
   */
  includes: <T>(array: RA<T>, item: unknown): item is T =>
    array.includes(item as T),

  unique: <ITEM>(array: RA<ITEM>): RA<ITEM> => Array.from(new Set(array)),

  parseInt(value: string | undefined): number | undefined {
    if (value === undefined) return undefined;
    const number = Number.parseInt(value);
    return Number.isNaN(number) ? undefined : number;
  },

  parseFloat(value: string | undefined): number | undefined {
    if (value === undefined) return undefined;
    const number = Number.parseFloat(value);
    return Number.isNaN(number) ? undefined : number;
  },

  between: <T>(
    min: number,
    max: number,
    callback: (value: number, index: number) => T,
  ): RA<T> =>
    Array.from({ length: max - min }, (_, index) =>
      callback(min + index, index),
    ),
} as const;
