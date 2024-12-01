import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getUniqueName } from '@common/utils/uniquifyName';

describe('getUniqueName', () => {
  const runs: readonly [
    parameters: Parameters<typeof getUniqueName>,
    result: string,
  ][] = [
    // Simple
    [['a', []], 'a'],
    [['a', ['b', 'ab']], 'a'],
    [['a', ['a']], 'a (2)'],
    [['a', ['a', 'a (1)']], 'a (2)'],
    [['a', ['a', 'a (1)', 'a (2)']], 'a (3)'],
    [['a', ['a', 'a (2)']], 'a (3)'],
    [['a', ['a', 'a (3)']], 'a (4)'],
    [['a', ['a', 'a (3)']], 'a (4)'],

    // Type "name"
    [['a', ['a'], undefined, 'name'], 'a_2'],
    [['a', ['a', 'a (3)', 'a_2'], undefined, 'name'], 'a_3'],

    // Max length
    [['abcdef', [], 5], 'abcde'],
    [['abcdef', ['abcdef'], 5], 'abcde'],
    [['abcdef', ['abcdef'], 6], 'abcde'],
    [['abcdef', ['abcdef', 'abcde'], 6], 'abcd'],
    [['abcdef', ['abcdef', 'abcde', 'abcd'], 6], 'abc'],
    [['abcdef', ['abcdef', 'abcde', 'abcd', 'abc'], 6], 'ab'],
    // Once there is enough space for (2), it will be added, otherwise, truncate
    [['abcdef', ['abcdef', 'abcde', 'abcd', 'abc', 'ab'], 6], 'ab (2)'],

    // Pad length
    // If "padLength" is present, suffix must be added, even if unique
    // This is so that the sorting order is correct when getUniqueName is called
    // again with the same name
    [['abcdef', [], undefined, undefined, 1], 'abcdef (1)'],
    [['abcdef', [], undefined, undefined, 2], 'abcdef (01)'],
    [['abcdef', [], 5, undefined, 1], 'a (1)'],
    [['a', ['a'], undefined, undefined, 1], 'a (2)'],
    [['a', ['a'], undefined, undefined, 2], 'a (02)'],
    [['a', ['a', 'a (2)'], undefined, undefined, 2], 'a (03)'],
    [['a', ['a', 'a (02)'], undefined, undefined, 2], 'a (03)'],
    [['a', ['a', 'a (00002)'], undefined, undefined, 2], 'a (03)'],
    [
      [
        'abcdef',
        ['abcdef', 'abcde', 'abcd', 'abc', 'ab', 'a'],
        6,
        undefined,
        2,
      ],
      'a (02)',
    ],
  ];

  runs.forEach(([parameters, result], index) =>
    test(`[${index}] ${parameters[0]} -> ${result}`, () => {
      assert.equal(getUniqueName(...parameters), result);
    }),
  );
});
