import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import { commonText } from '../../localization/common';
import type { IR, RA, WritableArray } from '../../utils/types';
import { filterArray, writable } from '../../utils/types';
import { sortFunction } from '../../utils/utils';
import { dateFormatter, formatNumber } from '../Atoms/Internationalization';
import type { IndexedBook } from './Charts';
import { fakeYear, toFakeDate } from './Charts';

Chart.register(
  BarController,
  BarElement,
  Tooltip,
  CategoryScale,
  TimeScale,
  PointElement,
  Title
);

export function YearCharts({
  year,
  books,
}: {
  readonly year: number;
  readonly books: IR<RA<IndexedBook>>;
}): JSX.Element {
  return (
    <>
      <BarChart books={books[year]} count="books" year={year} />
      <BarChart books={books[year]} count="pages" year={year} />
    </>
  );
}

function BarChart({
  year,
  books,
  count,
}: {
  readonly year: number;
  readonly books: RA<IndexedBook>;
  readonly count: 'books' | 'pages';
}): JSX.Element {
  const { labels, tooltipTitles, tooltipLabels, data } = React.useMemo(
    () => getData(books, count, year),
    [books, year, count]
  );
  return (
    <Bar
      className="flex-1"
      data={{
        labels: writable(labels),
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
              title: ([{ dataIndex }]): string =>
                tooltipTitles[dataIndex] ?? dataIndex.toString(),
              label: ({ dataIndex }): string =>
                tooltipLabels[dataIndex] ?? dataIndex.toString(),
            },
          },
        },
        scales: {
          x: {
            min: `${fakeYear}-01-01`,
            max: `${fakeYear + 1}-01-01`,
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
  books: RA<IndexedBook>,
  count: 'books' | 'pages',
  year: number
): {
  readonly labels: RA<string>;
  readonly tooltipLabels: RA<string>;
  readonly tooltipTitles: RA<string>;
  readonly data: RA<readonly [string, string]>;
} {
  const min = new Date(year, 0, 1);
  const max = new Date(year + 1, 0, 1);
  const rawData = Array.from(
    filterArray(
      books.map(
        ({
          title,
          readTime: { start: rawStart, end = rawStart },
          resolvedPageCount,
        }) => {
          const start = rawStart ?? end;
          if (start === undefined || end === undefined) return undefined;
          const nextDayEnd = new Date(end);
          nextDayEnd.setDate(nextDayEnd.getDate() + 1);

          const resolvedStart = start < min ? min : start;
          const resolvedEnd = nextDayEnd > max ? max : nextDayEnd;

          return {
            start: toFakeDate(resolvedStart),
            end: toFakeDate(resolvedEnd),
            label: `${dateFormatter.format(start)} - ${dateFormatter.format(
              end
            )}`,
            pages: resolvedPageCount,
            title,
          };
        }
      )
    )
  ).sort(sortFunction(({ start }) => start, true));
  const data = rawData.map(({ start, end }) => [start, end] as const);
  const reversed = Array.from(rawData).reverse();
  const labels =
    count === 'books'
      ? reversed.map((_, i) => (i + 1).toString()).reverse()
      : reversed
          .reduce<WritableArray<number>>((total, { pages: raw }) => {
            const pages = typeof raw === 'number' ? raw : 1;
            total.push((total.at(-1) ?? 0) + pages);
            return total;
          }, [])
          .map(formatNumber)
          .reverse();
  return {
    labels,
    data,
    tooltipTitles: rawData.map(({ title }) => title),
    tooltipLabels: rawData.map(({ label }) => label),
  };
}
