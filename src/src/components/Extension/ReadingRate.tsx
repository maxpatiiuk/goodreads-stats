import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  PointElement,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import { commonText } from '../../localization/common';
import { f } from '../../utils/functools';
import type { IR, RA, RR } from '../../utils/types';
import { filterArray, writable } from '../../utils/types';
import { toggleItem } from '../../utils/utils';
import { Button } from '../Atoms';
import type { IndexedBook } from './Charts';

Chart.register(BarController, BarElement, Tooltip, CategoryScale, PointElement);

const rows = {
  books: commonText('books'),
  pages: commonText('pages'),
  booksPerDay: commonText('booksPerDay'),
  pagesPerDay: commonText('pagesPerDay'),
  booksPerDayFiltered: commonText('booksPerDayFiltered'),
  pagesPerDayFiltered: commonText('pagesPerDayFiltered'),
  averageBookLength: commonText('averageBookLength'),
  longestBook: commonText('longestBook'),
  shortestBook: commonText('shortestBook'),
};

export function ReadingRate({
  books,
}: {
  readonly books: IR<RA<IndexedBook>>;
}): JSX.Element {
  const data = React.useMemo(() => getData(books), [books]);
  const [expanded, setExpanded] = React.useState<RA<keyof typeof rows>>([]);
  const stickyClassName = 'sticky left-0 bg-white';
  return (
    <table
      className="grid-table grid-cols-[max-content_repeat(var(--columns),1fr)] gap-2 overflow-y-auto"
      style={
        {
          '--columns': Object.keys(books).length,
        } as React.CSSProperties
      }
    >
      <thead>
        <tr>
          <td className={stickyClassName} />
          {Object.keys(books).map((year) => (
            <th key={year}>{year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(rows).map(([key, header]) => (
          <tr key={key}>
            <th className={stickyClassName}>
              <Button.Icon
                aria-pressed={expanded.includes(key)}
                icon={expanded.includes(key) ? 'chevronRight' : 'chevronDown'}
                title={
                  expanded.includes(key)
                    ? commonText('collapse')
                    : commonText('expand')
                }
                onClick={(): void => setExpanded(toggleItem(expanded, key))}
              />
              {header}
            </th>
            {expanded.includes(key) ? (
              <td className="col-[span_var(--columns)/span_var(--columns)]">
                <SimpleBarChart data={data} row={key} />
              </td>
            ) : (
              Object.values(data).map((data, index) => (
                <td key={index}>{data[key]}</td>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const getData = (
  books: IR<RA<IndexedBook>>
): IR<RR<keyof typeof rows, number>> =>
  Object.fromEntries(
    Object.entries(books).map(
      ([year, data]) =>
        [year, computeYear(data, Number.parseInt(year))] as const
    )
  );

function computeYear(
  data: RA<IndexedBook>,
  year: number
): RR<keyof typeof rows, number> {
  const books = data.length;
  const pages = data.reduce(
    (sum, { resolvedPageCount }) =>
      sum + (typeof resolvedPageCount === 'number' ? resolvedPageCount : 1),
    0
  );
  const yearLength = isLeapYear(year) ? 366 : 365;
  const booksPerDay = books / yearLength;
  const pagesPerDay = pages / yearLength;

  const nonEmptyDays = getReadDayCount(data, year);
  const booksPerDayFiltered = books / nonEmptyDays;
  const pagesPerDayFiltered = pages / nonEmptyDays;

  const bookLengths = Array.from(
    filterArray(
      data.map(({ resolvedPageCount }) =>
        typeof resolvedPageCount === 'number' ? resolvedPageCount : undefined
      )
    )
  ).sort(f.id);

  return {
    books: round(books),
    pages: round(pages),
    booksPerDay: round(booksPerDay),
    pagesPerDay: round(pagesPerDay),
    booksPerDayFiltered: round(booksPerDayFiltered),
    pagesPerDayFiltered: round(pagesPerDayFiltered),
    averageBookLength: round(
      bookLengths.reduce((sum, length) => sum + length, 0) / bookLengths.length
    ),
    longestBook: bookLengths.at(-1) ?? 0,
    shortestBook: bookLengths[0] ?? 0,
  };
}

const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

/**
 * Count days at which at least one book was read/in-progress
 */
const getReadDayCount = (data: RA<IndexedBook>, year: number): number =>
  new Set(
    data
      .flatMap<Date>(({ readTime: { start, end } }) =>
        start === undefined || end === undefined
          ? []
          : getDaysBetweenDates(start, end)
      )
      .filter((date) => date.getFullYear() === year)
      .map((date) => `${date.getMonth()}-${date.getDate()}`)
  ).size;

function getDaysBetweenDates(startDate: Date, endDate: Date): RA<Date> {
  if (startDate.toDateString() === endDate.toDateString())
    return [new Date(startDate)];
  else if (startDate > endDate) return [];
  else {
    const nextDate = new Date(startDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return [new Date(startDate), ...getDaysBetweenDates(nextDate, endDate)];
  }
}

const round = (number: number): number => Math.round(number * 100) / 100;

function SimpleBarChart({
  data: allData,
  row,
}: {
  readonly data: ReturnType<typeof getData>;
  readonly row: keyof typeof rows;
}): JSX.Element {
  const data = React.useMemo(
    () => Object.values(allData).map((data) => data[row]),
    [allData, row]
  );
  return (
    <div className="w-96">
      <Bar
        data={{
          labels: writable(Object.keys(allData)),
          datasets: [
            {
              data,
            },
          ],
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {},
          },
        }}
      />
    </div>
  );
}

export const exportsForTests = {
  isLeapYear,
  getDaysBetweenDates,
};
