import { mockTime } from '../../../tests/helpers';
import { theories } from '../../../tests/utils';
import { formatNumber, getRelativeDate } from '../Internationalization';

theories(formatNumber, {
  '0': { in: [0], out: '0' },
  '-0': { in: [-0], out: '-0' },
  '+0': { in: [+0], out: '0' },
  '-100,000': { in: [-100_000], out: '-100,000' },
  '1,000,000': { in: [1_000_000], out: '1,000,000' },
});

describe('getRelativeDate', () => {
  mockTime();

  test('now', () => {
    const date = new Date();

    expect(getRelativeDate(date)).toBe('now');
  });
  test('1 second ago', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 1);

    expect(getRelativeDate(date)).toBe('1 second ago');
  });
  test('5 seconds ago', () => {
    const date = new Date();
    date.setSeconds(date.getSeconds() - 5);

    expect(getRelativeDate(date)).toBe('5 seconds ago');
  });
  test('7 minutes ago', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 7);

    expect(getRelativeDate(date)).toBe('7 minutes ago');
  });
  test('23 hours ago', () => {
    const date = new Date();
    date.setHours(date.getHours() - 23);

    expect(getRelativeDate(date)).toBe('23 hours ago');
  });
  test('2 days ago', () => {
    const date = new Date();
    date.setDate(date.getDate() - 2);

    expect(getRelativeDate(date)).toBe('2 days ago');
  });
  test('2 weeks ago', () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);

    expect(getRelativeDate(date)).toBe('2 weeks ago');
  });
  test('5 months ago', () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 5);

    expect(getRelativeDate(date)).toBe('5 months ago');
  });
  test('3 years ago', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 3);

    expect(getRelativeDate(date)).toBe('3 years ago');
  });
});
