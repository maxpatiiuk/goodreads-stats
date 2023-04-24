import {
  camelToHuman,
  capitalize,
  group,
  mappedFind,
  multiSortFunction,
  replaceItem,
  sortFunction,
  toggleItem,
} from '../utils';
import { theories } from '../../tests/utils';

theories(capitalize, {
  'simple case': { in: ['capitalize'], out: 'Capitalize' },
  'works with non-ascii characters': { in: ['çA'], out: 'ÇA' },
  'does not break emojis': { in: ['❤️'], out: '❤️' },
});

theories(camelToHuman, [{ in: ['camelCase'], out: 'Camel Case' }]);

describe('sortFunction', () => {
  test('Numbers', () => {
    expect([10, 100, 1, 66, 5, 8, 2].sort(sortFunction((a) => a))).toEqual([
      1, 2, 5, 8, 10, 66, 100,
    ]);
  });
  test('Strings', () => {
    expect(['a', '6', 'bb', 'aba', '_a'].sort(sortFunction((a) => a))).toEqual([
      '_a',
      '6',
      'a',
      'aba',
      'bb',
    ]);
  });
  test('Custom function for Numbers', () => {
    expect(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(
        sortFunction((value) => Math.abs(5 - value))
      )
    ).toEqual([5, 4, 6, 3, 7, 2, 8, 1, 9, 10]);
  });
  test('Custom function for Numbers (reversed)', () => {
    expect(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(
        sortFunction((value) => Math.abs(5 - value), true)
      )
    ).toEqual([10, 1, 9, 2, 8, 3, 7, 4, 6, 5]);
  });
});

test('multiSortFunction', () => {
  expect(
    [
      { type: 'c', priority: 3 },
      { type: 'd', priority: 4 },
      { type: 'd', priority: 3 },
      { type: 'c', priority: 4 },
    ].sort(
      multiSortFunction(
        ({ type }) => type,
        ({ priority }) => priority,
        true
      )
    )
  ).toEqual([
    { type: 'c', priority: 4 },
    { type: 'c', priority: 3 },
    { type: 'd', priority: 4 },
    { type: 'd', priority: 3 },
  ]);
});

theories(toggleItem, {
  'add an item that is not present': { in: [[1, 2, 3], 4], out: [1, 2, 3, 4] },
  'remove an item that is present': { in: [[1, 2, 3, 4], 4], out: [1, 2, 3] },
  'remove duplicate item': { in: [[1, 2, 3, 1], 1], out: [2, 3] },
});

theories(replaceItem, {
  'replace at the beginning': { in: [[0, 2, 3, 4], 0, 1], out: [1, 2, 3, 4] },
  'replace in the middle': { in: [[1, 0, 3, 4], 1, 2], out: [1, 2, 3, 4] },
  'replace at the end': { in: [[1, 2, 3, 0], 3, 4], out: [1, 2, 3, 4] },
  'replace from the end': { in: [[1, 2, 3, 0], -1, 4], out: [1, 2, 3, 4] },
  'replace after the end': { in: [[1, 2, 3], 99, 4], out: [1, 2, 3, 4] },
});

theories(group, [
  {
    in: [
      [
        ['a', 1],
        ['a', 2],
        ['b', 3],
        ['c', 4],
        ['a', 5],
      ],
    ],
    out: [
      ['a', [1, 2, 5]],
      ['b', [3]],
      ['c', [4]],
    ],
  },
]);

describe('mappedFind', () => {
  test('Found value', () => {
    expect(
      mappedFind([undefined, 1, 2, 3, 4, 5], (value) =>
        typeof value === 'number' ? value * 2 : undefined
      )
    ).toBe(2);
  });
  test('Not found a value', () => {
    expect(
      mappedFind([undefined, undefined, undefined], (value) => value)
    ).toBe(undefined);
  });
});
