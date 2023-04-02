import React from 'react';

import { getRelativeDate } from '../Atoms/Internationalization';

const longDate = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'full',
  timeStyle: 'long',
});

export function DateElement({
  date,
  fallback = undefined,
  // If true, display full date by default and relative date as a tooltip
  flipDates = false,
}: {
  readonly date: string | undefined;
  readonly fallback?: React.ReactNode;
  readonly flipDates?: boolean;
}): JSX.Element {
  if (typeof date !== 'string' || Number.isNaN(Date.parse(date)))
    return <>{fallback}</>;
  const dateObject = new Date(date);
  const relativeDate = getRelativeDate(dateObject);
  const fullDate = longDate.format(dateObject);
  const [children, title] = flipDates
    ? [fullDate, relativeDate]
    : [relativeDate, fullDate];
  return (
    <time dateTime={dateObject.toISOString()} title={title}>
      {children}
    </time>
  );
}
