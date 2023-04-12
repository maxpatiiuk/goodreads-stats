import 'chartjs-adapter-date-fns';

import type { ChartDataset } from 'chart.js';
import {
  Chart,
  LineController,
  Tooltip,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Colors,
  Legend,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { R, RA } from '../../utils/types';
import type { Book } from '../Foreground/readPages';
import { sortFunction } from '../../utils/utils';

Chart.register(
  LineController,
  Tooltip,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Colors,
  Legend
);

export function Charts({ books }: { readonly books: RA<Book> }): JSX.Element {
  // FIXME: provide a way to change this
  const [type = 'books'] = useStorage('chartType');
  const datasets = React.useMemo(() => getData(books, type), [books, type]);
  return (
    <div>
      <Line
        className="flex-1"
        data={{
          datasets,
        }}
        // FIXME: tooltips
        options={{
          responsive: true,
          plugins: {
            legend: {},
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
              // FIXME: test which of these options are required
              ticks: {
                autoSkip: false,
              },
            },
            y: {
              title: {
                text:
                  type === 'books' ? commonText('books') : commonText('pages'),
              },
            },
          },
        }}
      />
    </div>
  );
}

/**
 * FIXME: all years line chart for book count/page count
 * FIXME: year selector
 * FIXME: single year horizontal stacked chart for book count/page count
 * FIXME: reading velocity
 * FIXME: properly interpret audiobooks page count
 */

function getData(
  books: RA<Book>,
  type: 'books' | 'pages'
): RA<ChartDataset<'line', RA<{ readonly x: string; readonly y: number }>>> {
  const data: Record<number, R<number>> = {};
  books.forEach((book) =>
    book.readTimes.forEach((readTime) => {
      if (readTime.end === undefined) return;
      const end = new Date(readTime.end);
      const year = end.getFullYear();
      const month = (end.getMonth() + 1).toString().padStart(2, '0');
      const day = end.getDate().toString().padStart(2, '0');
      /*
       * Using arbitrary leap year. Need to use the same year for all dates so
       * that multiple datasets are properly overlapped on top of each other
       */
      const fakeYear = 1972;
      const formatted = `${fakeYear}-${month}-${day}`;
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
