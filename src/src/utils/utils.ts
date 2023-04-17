/**
 * Collection of various helper methods
 *
 * @module
 */
import type { RA, RR } from './types';

export const capitalize = <T extends string>(string: T): Capitalize<T> =>
  (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;

export const camelToHuman = (value: string): string =>
  capitalize(value.replace(/([a-z])([A-Z])/gu, '$1 $2'));

/** Generate a sort function for Array.prototype.sort */
export const sortFunction =
  <T, V extends boolean | number | string | null | undefined>(
    mapper: (value: T) => V,
    reverse: true | undefined = undefined
  ): ((left: T, right: T) => -1 | 0 | 1) =>
  (left: T, right: T): -1 | 0 | 1 => {
    const [leftValue, rightValue] =
      reverse === true
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

/** Remove item from array if present, otherwise, add it */
export const toggleItem = <T>(array: RA<T>, item: T): RA<T> =>
  array.includes(item)
    ? array.filter((value) => value !== item)
    : [...array, item];

/** Create a new array with a given item replaced */
export const replaceItem = <T>(array: RA<T>, index: number, item: T): RA<T> =>
  array[index] === item
    ? array
    : [
        ...array.slice(0, index),
        item,
        ...(index === -1 ? [] : array.slice(index + 1)),
      ];

/**
 * Convert an array of [key,value] tuples to a RA<[key, RA<value>]>
 *
 * @remarks
 * KEY doesn't have to be a string. It can be of any time
 */
export const group = <KEY, VALUE>(
  entries: RA<readonly [key: KEY, value: VALUE]>
): RA<readonly [key: KEY, values: RA<VALUE>]> =>
  Array.from(
    entries
      // eslint-disable-next-line functional/prefer-readonly-type
      .reduce<Map<KEY, RA<VALUE>>>(
        (grouped, [key, value]) =>
          grouped.set(key, [...(grouped.get(key) ?? []), value]),
        new Map()
      )
      .entries()
  );

export const count = <T extends PropertyKey>(array: RA<T>): RR<T, number> =>
  array.reduce<Partial<Record<T, number>>>((counts, item) => {
    counts[item] ??= 0;
    counts[item]! += 1;
    return counts;
  }, {}) as RR<T, number>;

export const sum = (array: RA<number>): number =>
  array.reduce((sum, value) => sum + value, 0);

// Find a value in an array, and return it's mapped variant
export function mappedFind<ITEM, RETURN_TYPE>(
  array: RA<ITEM>,
  callback: (item: ITEM, index: number) => RETURN_TYPE | undefined
): RETURN_TYPE | undefined {
  let value = undefined;
  array.some((item, index) => {
    value = callback(item, index);
    return value !== undefined;
  });
  return value;
}

export function debounce<T extends RA<unknown>>(
  callback: (...args: T) => void,
  timeout: number
): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), timeout);
  };
}

/**
 * Based on simplified version of Underscore.js's throttle function
 */
export function throttle<T extends RA<unknown>>(
  callback: (...args: T) => void,
  wait: number
): (...args: T) => void {
  let previous = 0;
  return (...newArguments: T): void => {
    const time = Date.now();
    previous ??= time;
    const remaining = wait - (time - previous);
    if (remaining <= 0 || remaining > wait) {
      previous = time;
      callback(...newArguments);
    }
  };
}

export function parseXml(
  string: string,
  type: 'text/html' | 'text/xml' = 'text/xml'
): Element | string {
  const parsedXml = new window.DOMParser().parseFromString(
    string,
    type
  ).documentElement;

  // Chrome, Safari
  const parseError = parsedXml.getElementsByTagName('parsererror')[0];
  if (typeof parseError === 'object')
    return (parseError.children[1].textContent ?? parseError.innerHTML).trim();
  // Firefox
  else if (parsedXml.tagName === 'parsererror')
    return (
      parsedXml.childNodes[0].nodeValue ??
      parsedXml.textContent ??
      parsedXml.innerHTML
    ).trim();
  else return parsedXml;
}

export function strictParseXml(
  xml: string,
  type: 'text/html' | 'text/xml' = 'text/xml'
): Element {
  const parsed = parseXml(xml, type);
  if (typeof parsed === 'string') throw new Error(parsed);
  else return parsed;
}
