import type { RA } from '../../utils/types';
import type { ParsedBook } from './Charts';
import { Bar } from 'react-chartjs-2';
import { commonText } from '../../localization/common';
import React from 'react';
import {
  Chart,
  Colors,
  BarController,
  BarElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  CategoryScale,
} from 'chart.js';
import { sortFunction } from '../../utils/utils';
import { filterArray } from '../../utils/types';
import { toFakeDate } from './Charts';

Chart.register(
  BarController,
  BarElement,
  Tooltip,
  CategoryScale,
  TimeScale,
  PointElement,
  Colors,
  Title
);

export function YearCharts({
  year,
  books: rawData,
}: {
  readonly year: number;
  readonly books: RA<ParsedBook>;
}): JSX.Element {
  const books = React.useMemo(
    () =>
      rawData
        .map((book) => ({
          ...book,
          readTimes: book.readTimes.filter(
            ({ end }) => end?.getFullYear() === year
          ),
        }))
        .filter(({ readTimes }) => readTimes.length > 0),
    [rawData, year]
  );
  return (
    <>
      <BarChart year={year} books={books} count="books" />
      {/*<BarChart year={year} books={books} count="pages" />*/}
    </>
  );
}

function BarChart({
  year,
  books,
  count,
}: {
  readonly year: number;
  readonly books: RA<ParsedBook>;
  readonly count: 'books' | 'pages';
}): JSX.Element {
  const min = new Date(year, 0, 1);
  const { labels, data } = React.useMemo(
    () => getData(books, count, year),
    [books, year, count]
  );
  return (
    <Bar
      className="flex-1"
      data={{
        labels,
        datasets: [
          {
            label: year.toString(),
            data,
          },
        ],
      }}
      options={{
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text:
              count === 'books'
                ? commonText('booksPerYear')
                : commonText('pagesPerYear'),
          },
          tooltip: {
            callbacks: {
              // label: (context): string =>
              //   dateFormatter.format(new Date(context.raw.x)),
              // title: ([context]): string => context.dataset.label,
            },
          },
        },
        scales: {
          x: {
            min: '1972-01-01',
            max: '1973-01-01',
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM',
              },
            },
            title: {
              text: commonText('month'),
            },
          },
          y: {
            beginAtZero: true,
            title: {
              text:
                count === 'books' ? commonText('books') : commonText('pages'),
            },
          },
        },
      }}
    />
  );
}

function getData(
  books: RA<ParsedBook>,
  count: 'books' | 'pages',
  year: number
): {
  readonly labels: RA<string>;
  readonly data: RA<readonly [string, string]>;
} {
  const min = new Date(year, 0, 1);
  const max = new Date(year + 1, 0, 1);
  const data = Array.from(
    filterArray(
      books.flatMap((book) =>
        book.readTimes.map(({ start: rawStart, end = rawStart }) => {
          const start = rawStart ?? end;
          if (start === undefined || end === undefined) return undefined;
          const nextDayEnd = new Date(end);
          nextDayEnd.setDate(nextDayEnd.getDate() + 1);

          const resolvedStart = start < min ? min : start;
          const resolvedEnd = nextDayEnd > max ? max : nextDayEnd;

          return [toFakeDate(resolvedStart), toFakeDate(resolvedEnd)] as const;
        })
      )
    )
  ).sort(sortFunction(([start]) => start, true));
  const labels = data.map((_, i) => (i + 1).toString()).reverse();
  return { labels, data };
}
