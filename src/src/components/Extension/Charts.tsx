import 'chartjs-adapter-date-fns';

import type { ChartDataset } from 'chart.js';
import {
  Chart,
  Colors,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

import { commonText } from '../../localization/common';
import { f } from '../../utils/functools';
import type { R, RA } from '../../utils/types';
import { filterArray, writable } from '../../utils/types';
import { group, sortFunction } from '../../utils/utils';
import { Label, Select } from '../Atoms';
import { dateFormatter } from '../Atoms/Internationalization';
import type { Book } from '../Foreground/readPages';
import { ReadingRate } from './ReadingRate';
import { YearCharts } from './YearCharts';

Chart.register(
  LineController,
  Tooltip,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  // @ts-expect-error Seems to be a typing mistake in the library
  Colors
);

type ParsedBook = Omit<Book, 'readTimes'> & {
  readonly readTimes: RA<{
    readonly start: Date | undefined;
    readonly end: Date | undefined;
  }>;
};

export type IndexedBook = Omit<ParsedBook, 'readTimes'> & {
  readonly readTime: ParsedBook['readTimes'][number];
};

export function Charts({
  books: rawBooks,
}: {
  readonly books: RA<Book>;
}): JSX.Element {
  const books = React.useMemo(
    () =>
      rawBooks.map((book) => ({
        ...book,
        readTimes: book.readTimes.map(({ start, end }) => ({
          start: start === undefined ? undefined : new Date(start),
          end: end === undefined ? undefined : new Date(end),
        })),
      })),
    [rawBooks]
  );
  const indexedBooks = React.useMemo(
    () =>
      Object.fromEntries(
        Array.from(
          group(
            books.flatMap(({ readTimes, ...book }) =>
              filterArray(
                readTimes.map((readTime) =>
                  readTime.end === undefined
                    ? undefined
                    : ([
                        readTime.end?.getFullYear(),
                        {
                          ...book,
                          readTime,
                        },
                      ] as const)
                )
              )
            )
          )
        ).sort(([year]) => year)
      ),
    [books]
  );
  const years = Object.keys(indexedBooks);
  const [year, setYear] = React.useState<number | undefined>(
    f.parseInt(years.at(-1) ?? '')
  );
  return (
    <div className="flex flex-col gap-8">
      <LineChart books={books} count="books" />
      <LineChart books={books} count="pages" />
      <Label.Inline>
        {commonText('year')}
        <Select
          value={year}
          onValueChange={(year): void => setYear(f.parseInt(year))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </Label.Inline>
      <ReadingRate books={indexedBooks} />
      {typeof year === 'number' && (
        <YearCharts books={indexedBooks} year={year} />
      )}
    </div>
  );
}

function LineChart({
  books,
  count,
}: {
  readonly books: RA<ParsedBook>;
  readonly count: 'books' | 'pages';
}): JSX.Element {
  const datasets = React.useMemo(() => getData(books, count), [books, count]);
  return (
    <Line
      className="flex-1"
      data={{
        datasets: writable(datasets),
      }}
      options={{
        plugins: {
          title: {
            display: true,
            text:
              count === 'books'
                ? commonText('booksPerYear')
                : commonText('pagesPerYear'),
          },
          legend: {},
          tooltip: {
            callbacks: {
              label: (context): string =>
                dateFormatter.format(
                  new Date((context.raw as { readonly x: string }).x)
                ),
              title: ([context]): string => context.dataset.label ?? '',
            },
          },
        },
        scales: {
          x: {
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
  type: 'books' | 'pages'
): RA<ChartDataset<'line', RA<{ readonly x: string; readonly y: number }>>> {
  const data: Record<number, R<number>> = {};
  books.forEach((book) =>
    book.readTimes.forEach(({ end }) => {
      if (end === undefined) return;
      const year = end.getFullYear();
      const formatted = toFakeDate(end);
      data[year] ??= {};
      data[year][formatted] ??= 0;
      data[year][formatted] +=
        type === 'books'
          ? 1
          : typeof book.pageCount === 'number'
          ? book.pageCount
          : 0;
    })
  );
  return Object.entries(data).map(([year, data]) => ({
    label: year,
    data: Object.entries(
      Object.entries(data)
        .sort(sortFunction(([date]) => date))
        .reduce<{
          readonly total: number;
          readonly dates: R<number>;
        }>(
          ({ total, dates }, [date, count]) => {
            dates[date] = total + count;
            return { total: total + count, dates };
          },
          { total: 0, dates: {} }
        ).dates
    ).map(([date, count]) => ({ x: date, y: count })),
  }));
}

export const fakeYear = 1972;

export function toFakeDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  /*
   * Using arbitrary leap year. Need to use the same year for all dates so
   * that multiple datasets are properly overlapped on top of each other
   */
  return `${fakeYear}-${month}-${day}`;
}
