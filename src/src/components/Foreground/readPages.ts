import { f } from '../../utils/functools';
import { formatUrl } from '../../utils/queryString';
import type { RA, WritableArray } from '../../utils/types';
import { ensure } from '../../utils/types';
import { strictParseXml } from '../../utils/utils';

/*
 * FEATURE: retrieve entire timeline for a book
 *  (when added to to-read list, any progress reported, other events)
 */
/**
 * Fetch all pages of the RSS feed and extra information for each book
 */
export async function readPages(
  rssLink: string,
  progress: (count: number) => void
): Promise<Takeout> {
  const xml = await fetch(rssLink)
    .then(async (response) => response.text())
    .then(strictParseXml);
  const description = xml.querySelector('description')?.textContent ?? '';
  const lastBuildDate = new Date(
    xml.querySelector('lastBuildDate')?.textContent ?? ''
  ).toJSON();
  return {
    description,
    lastBuildDate,
    books: await fetchPage(xml, rssLink, progress),
  };
}

export type Takeout = {
  readonly description: string;
  readonly lastBuildDate: string;
  readonly books: RA<Book>;
};

/**
 * Recursively fetch pages of the rss feed and extra information for each book
 */
async function fetchPage(
  element: Element,
  rssLink: string,
  progress: (count: number) => void,
  page = 2
): Promise<RA<Book>> {
  const rawItems = Array.from(element.querySelectorAll('item'));
  const items = await parseItems(rawItems, progress);
  if (items.length === 0) return [];

  const xml = await fetch(`${rssLink}&page=${page}`)
    .then(async (response) => response.text())
    .then(strictParseXml);
  return [
    ...items,
    ...(await fetchPage(
      xml,
      rssLink,
      (count) => progress(rawItems.length + count),
      page + 1
    )),
  ];
}

/**
 * Extract the information from the rss feed for fetched books, and fetch extra
 * information for each book
 */
async function parseItems(
  rawItems: RA<Element>,
  progress: (index: number) => void
): Promise<RA<Book>> {
  const items = rawItems.map(parseItem);
  const newItems: WritableArray<Book> = [];
  // Using for-loop so as to make requests sequentially
  // eslint-disable-next-line functional/no-loop-statement
  for (const [index, item] of items.entries()) {
    // eslint-disable-next-line no-await-in-loop
    const extraDetails = await fetchExtraDetails(item);
    newItems.push({ ...item, ...extraDetails });
    progress(index);
  }
  return newItems;
}

const selectors = {
  title: 'title',
  link: 'link',
  id: 'book_id',
  imageUrl: 'book_image_url',
  smallImageUrl: 'book_small_image_url',
  mediumImageUrl: 'book_medium_image_url',
  largeImageUrl: 'book_large_image_url',
  description: 'book_description',
  pageCount: 'book num_pages',
  authorName: 'author_name',
  userRating: 'user_rating',
  userDateAdded: 'user_date_created',
  userShelves: 'user_shelves',
  userReview: 'user_review',
  averageRating: 'average_rating',
  publicationYear: 'book_published',
} as const;

const parseItem = (element: Element): BaseBook =>
  Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => {
      const content = element.querySelector(selector)?.textContent;
      if (content === undefined)
        console.warn(`Unable to find ${selector}`, content);
      const value = f.includes(numericColumns, key)
        ? (f.parseFloat(content ?? '') as string | undefined) ?? content
        : content;
      return [key, value ?? ''] as const;
    })
  );

export const numericColumns = ensure<RA<keyof Book>>()([
  'pageCount',
  'resolvedPageCount',
  'averageRating',
  'userRating',
  'publicationYear',
] as const);
export const dateColumns = ensure<RA<keyof Book>>()(['userDateAdded'] as const);

type BaseBook = {
  readonly title: string;
  readonly link: string;
  readonly id: string;
  readonly imageUrl: string;
  readonly smallImageUrl: string;
  readonly mediumImageUrl: string;
  readonly largeImageUrl: string;
  readonly description: string;
  readonly pageCount: number | string;
  readonly authorName: string;
  readonly userRating: number | string;
  readonly userDateAdded: string;
  readonly userShelves: string;
  readonly userReview: string;
  readonly averageRating: number | string;
  readonly publicationYear: number | string;
};

type ExtraDetails = {
  readonly readTimes: RA<{
    readonly start: string | undefined;
    readonly end: string | undefined;
  }>;
  readonly authorLink: string | undefined;
  readonly privateNotes: string | undefined;
  /**
   * For audiobooks, the page count is representing number of hours, not number
   * of pages. Thus, have ot manually resolve it
   */
  readonly resolvedPageCount: number | string | undefined;
};

export type Book = BaseBook & ExtraDetails;

/**
 * Read times are not included in the RSS feed, nor in the goodreads takeouts.
 * Doesn't make any sense. Thus, have to make a separate request for each
 */
async function fetchExtraDetails(book: BaseBook): Promise<ExtraDetails> {
  const html = await fetch(`https://www.goodreads.com/review/edit/${book.id}`, {
    headers: {
      Accept: 'text/javascript',
    },
  })
    .then(async (response) => response.text())
    .then((response) =>
      JSON.parse(
        `"${properlyEscape(
          response
            .slice(response.indexOf("'") + 1, response.lastIndexOf("'"))
            .replaceAll("\\'", "'")
            .replaceAll('\\$', '$')
        )}"`
      )
    )
    .then((response) => strictParseXml(response, 'text/html'));

  // eslint-disable-next-line array-func/from-map
  const readTimes = Array.from(
    html.querySelectorAll('.readingSessionRow'),
    (container) =>
      Object.fromEntries(
        inputs.map((name) => [
          name,
          container.querySelector<HTMLOptionElement>(
            `.${name} option[selected]:not([disabled])`
          )?.value,
        ])
      )
  ).map(({ startYear, startMonth, startDay, endYear, endMonth, endDay }) => ({
    start: toDate(startYear, startMonth, startDay)?.toJSON(),
    end: toDate(endYear, endMonth, endDay)?.toJSON(),
  }));

  const authorLink = html.querySelector<HTMLAnchorElement>('.authorName')?.href;
  if (authorLink === undefined)
    console.error('Could not find author link', html);

  const privateNotes =
    html.querySelector<HTMLTextAreaElement>('#review_notes')?.value;
  if (privateNotes === undefined)
    console.error('Could not find private notes', html);

  const editionsUrl = html.querySelector<HTMLAnchorElement>(
    'a[href*="/editions/"]'
  )?.href;

  return {
    readTimes,
    authorLink,
    privateNotes,
    resolvedPageCount:
      /**
       * For audiobooks, the page count represents number of hours, not number of
       * pages. Thus, have to manually resolve it so that the charts represent
       * accurate data. The RSS feed does not have an indication of whether a book
       * is an audiobook, thus have to manually check any book under 100
       * pages(hours)
       */
      (typeof book.pageCount !== 'number' ||
        book.pageCount < maxAudioBookHours) &&
      typeof editionsUrl === 'string'
        ? await fetchPageCount(editionsUrl, book.pageCount).catch((error) => {
            console.error(error);
            return book.pageCount;
          })
        : book.pageCount,
  };
}

const escapes = {
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};
const invertedEscapes = Object.fromEntries(
  Object.entries(escapes).map(([key, value]) => [value, key])
);

/**
 * There are incorrectly escaped characters in the goodreads response. Need to
 * normalize them before sending to JSON.parse or else it will error out
 */
function properlyEscape(text: string): string {
  let isEscaped = false;
  const result = text
    .split('')
    .map((character) => {
      if (isEscaped) {
        isEscaped = false;
        return `\\${character}`;
      } else if (character === '\\') {
        isEscaped = true;
        return '';
      } else {
        if (character in invertedEscapes)
          return `\\${invertedEscapes[character]}`;
        return character;
      }
    })
    .join('');
  return isEscaped ? `${result}\\\\` : result;
}

const maxAudioBookHours = 100;

const inputs = [
  'startYear',
  'startMonth',
  'startDay',
  'endYear',
  'endMonth',
  'endDay',
];
const toDate = (
  year: string | undefined,
  month: string | undefined,
  day: string | undefined
): Date | undefined =>
  year === undefined || month === undefined || day === undefined
    ? undefined
    : new Date(`${year}-${month}-${day}`);

/**
 * Retrieve page count for the most popular non-audiobook edition of this book
 */
async function fetchPageCount(
  editionsUrl: string,
  rawPageCount: number | string
): Promise<number | string | undefined> {
  const fullUrl = formatUrl(editionsUrl, {
    sort: 'num_ratings',
  });
  const html = await fetch(fullUrl, { headers: { Accept: 'text/html' } })
    .then(async (response) => response.text())
    .then((response) => strictParseXml(response, 'text/html'));
  const editions = Array.from(
    html.querySelectorAll('.elementList'),
    (element) => {
      const format = element.querySelector(
        '.editionData > .dataRow:nth-child(3)'
      )?.textContent;
      return {
        isCurrent: element.querySelector('.wtrButtonContainer') !== null,
        isAudioBook:
          typeof format === 'string' &&
          // This might not work for non-english interface (though Audible still would match)
          (format.toLowerCase().includes('audi') || format.includes('CD')),
        pages: f.parseInt(
          format?.split(',').at(-1)?.replaceAll(/\D+/gu, '') ?? ''
        ),
      };
    }
  );
  const current = editions.find(({ isCurrent }) => isCurrent);
  if (current?.isAudioBook === false) return rawPageCount;
  const resolvedPageCount = editions.find(
    ({ pages, isAudioBook }) => typeof pages === 'number' && !isAudioBook
  )?.pages;

  return resolvedPageCount ?? rawPageCount;
}

export const exportsForTests = { properlyEscape };
