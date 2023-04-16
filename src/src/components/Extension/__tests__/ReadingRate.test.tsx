import { exportsForTests } from '../ReadingRate';

const { isLeapYear, getDaysBetweenDates } = exportsForTests;

describe('isLeapYear', () => {
  test('returns true for a leap year', () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  test('returns false for a non-leap year', () => {
    expect(isLeapYear(2021)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });
});

describe('getDaysBetweenDates', () => {
  test('returns an array with one date when the start and end dates are the same', () => {
    const startDate = new Date('2023-04-16');
    const endDate = new Date('2023-04-16');
    expect(getDaysBetweenDates(startDate, endDate)).toEqual([startDate]);
  });

  test('returns an array with all dates between the start and end dates, inclusive', () => {
    const startDate = new Date('2023-04-10');
    const endDate = new Date('2023-04-16');
    const expected = [
      new Date('2023-04-10'),
      new Date('2023-04-11'),
      new Date('2023-04-12'),
      new Date('2023-04-13'),
      new Date('2023-04-14'),
      new Date('2023-04-15'),
      new Date('2023-04-16'),
    ];
    expect(getDaysBetweenDates(startDate, endDate)).toEqual(expected);
  });

  test('returns an empty array when the end date is before the start date', () => {
    const startDate = new Date('2023-04-16');
    const endDate = new Date('2023-04-10');
    expect(getDaysBetweenDates(startDate, endDate)).toEqual([]);
  });
});
