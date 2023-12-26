import { IR, isDefined, type RA } from './types';

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

  /** Like Promise.all, but accepts a dictionary instead of an array */
  all: async <T extends IR<unknown>>(dictionary: {
    readonly [PROMISE_NAME in keyof T]:
      | Promise<T[PROMISE_NAME]>
      | T[PROMISE_NAME];
  }): Promise<T> =>
    Object.fromEntries(
      await Promise.all(
        Object.entries(dictionary).map(async ([promiseName, promise]) => [
          promiseName,
          await promise,
        ]),
      ),
    ) as T,

  min(...array: RA<number | undefined>): number | undefined {
    const data = array.filter(isDefined);
    return data.length === 0 ? undefined : Math.min(...data);
  },

  max(...array: RA<number | undefined>): number | undefined {
    const data = array.filter(isDefined);
    return data.length === 0 ? undefined : Math.max(...data);
  },
} as const;
