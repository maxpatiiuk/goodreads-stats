import { f } from '../functools';

describe('f.includes', () => {
  test('positive case', () => expect(f.includes([1, 2, 3], 1)).toBe(true));
  test('negative case', () => expect(f.includes([1, 2, 3], 4)).toBe(false));
  test('empty case', () => expect(f.includes([], 1)).toBe(false));
});

describe('f.parseInt', () => {
  test('simple case', () => expect(f.parseInt('1')).toBe(1));
  test('float case', () => expect(f.parseInt('-1.4')).toBe(-1));
  test('invalid case', () => expect(f.parseInt('a-1.4')).toBeUndefined());
});

describe('f.parseFloat', () => {
  test('simple case', () => expect(f.parseFloat('1')).toBe(1));
  test('float case', () => expect(f.parseFloat('-1.4')).toBe(-1.4));
  test('invalid case', () => expect(f.parseFloat('a-1.4')).toBeUndefined());
});

test('f.id returns the value it was passed', () => {
  const id = {};
  expect(f.id(id)).toBe(id);
});
