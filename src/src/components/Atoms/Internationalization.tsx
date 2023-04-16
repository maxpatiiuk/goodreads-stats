/**
 * Various tools to help internationalize the application
 */

import { LANGUAGE } from '../../localization/utils';
import type { RA } from '../../utils/types';

/* This is an incomplete definition. For complete, see MDN Docs */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  class NumberFormat {
    public constructor(locales?: RA<string> | string);

    public format(value: number): string;
  }

  class RelativeTimeFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly numeric: 'always' | 'auto';
        readonly style: 'long' | 'narrow' | 'short';
      }
    );

    public format(
      count: number,
      type: 'day' | 'hour' | 'minute' | 'month' | 'second' | 'week' | 'year'
    ): string;
  }

  class DateTimeFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly dateStyle?: 'full' | 'long' | 'medium' | 'short';
        readonly timeStyle?: 'full' | 'long' | 'medium' | 'short';
        readonly month?: 'long' | 'short';
        readonly weekday?: 'long' | 'short';
        readonly day?: 'numeric';
      }
    );

    public format(value: Readonly<Date>): string;
  }
}

export const dateFormatter = new Intl.DateTimeFormat(LANGUAGE, {
  month: 'long',
  day: 'numeric',
});

const numberFormatter = new Intl.NumberFormat(LANGUAGE);
export const formatNumber = (number: number): string =>
  numberFormatter.format(number);

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const MILLISECONDS = 1;
export const SECOND = 1000 * MILLISECONDS;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const MILLISECONDS_IN_DAY = DAY / MILLISECONDS;
export const MINUTES_IN_HOUR = HOUR / MINUTE;
export const WEEK = 7 * DAY;
export const MONTH = 4 * WEEK;
export const YEAR = 12 * MONTH;
/* eslint-enable @typescript-eslint/no-magic-numbers */
const relativeDate = new Intl.RelativeTimeFormat(LANGUAGE, {
  numeric: 'auto',
  style: 'long',
});

/** Does not support future dates */
export function getRelativeDate(date: Readonly<Date>): string {
  const timePassed = Date.now() - date.getTime();
  if (timePassed < 0) {
    /*
     * This happens due to time zone conversion issues.
     * Need to fix that issue on the back-end first.
     * See: https://github.com/specify/specify7/issues/641
     * Adding support for future dates is not hard, but it would be weird to
     * create a data set and see its date of creation be 5 hours into the
     * future
     */
    // Throw new Error('Future dates are not supported');
    console.error('Future dates are not supported');
    return relativeDate.format(0, 'second');
  } else if (timePassed <= MINUTE)
    return relativeDate.format(-Math.round(timePassed / SECOND), 'second');
  else if (timePassed <= HOUR)
    return relativeDate.format(-Math.round(timePassed / MINUTE), 'minute');
  else if (timePassed <= DAY)
    return relativeDate.format(-Math.round(timePassed / HOUR), 'hour');
  else if (timePassed <= WEEK)
    return relativeDate.format(-Math.round(timePassed / DAY), 'day');
  else if (timePassed <= MONTH)
    return relativeDate.format(-Math.round(timePassed / WEEK), 'week');
  else if (timePassed <= YEAR)
    return relativeDate.format(-Math.round(timePassed / MONTH), 'month');
  else return relativeDate.format(-Math.round(timePassed / YEAR), 'year');
}
