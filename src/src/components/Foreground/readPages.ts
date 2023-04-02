import type { RA } from '../../utils/types';
import { strictParseXml } from '../../utils/utils';

export async function readPages(
  rssLink: string,
  progress: (percentage: number) => void
): Promise<{
  readonly description: string;
  readonly lastBuildDate: Date;
  readonly items: RA<Item>;
}> {
  const rawItems = [];
  const xml = await fetch(rssLink)
    .then(async (response) => response.text())
    .then((text) => {
      rawItems.push(text);
      return text;
    })
    .then(strictParseXml);
  const description = xml.querySelector('description')?.textContent ?? '';
  const lastBuildDate = new Date(
    xml.querySelector('lastBuildDate')?.textContent ?? ''
  );
  const items = xml.querySelectorAll('item');
  return {
    description,
    lastBuildDate,
    rawItems,
    items: [
      ...items,
      ...(items.length === 0 ? [] : await fetchPage(rssLink, 2)),
    ].map(parseItem),
  };
}

async function fetchPage(rssLink: string, page: number): Promise<RA<Element>> {
  const xml = await fetch(`${rssLink}&page=${page}`)
    .then(async (response) => response.text())
    .then(strictParseXml);
  const items = xml.querySelectorAll('item');
  return [...items, ...(items.length === 0 ? [] : await fetchPage(rssLink, 2))];
}

// FIXME: test if all XML items have the same schema and date types

const parseItem = (element: Element): Item => ({
  title: element.querySelector('title')?.textContent ?? '',
  link: element.querySelector('link')?.textContent ?? '',
  bookId: element.querySelector('bookId')?.textContent ?? '',
  bookImageUrl: element.querySelector('book_image_url')?.textContent ?? '',
  bookSmallImageUrl:
    element.querySelector('book_small_image_url')?.textContent ?? '',
  bookMediumImageUrl:
    element.querySelector('book_medium_image_url')?.textContent ?? '',
  bookLargeImageUrl:
    element.querySelector('book_large_image_url')?.textContent ?? '',
  bookDescription: element.querySelector('book_description')?.textContent ?? '',
  pageCount: Number.parseInt(
    element.querySelector('book num_pages')?.textContent ?? ''
  ),
  authorName: element.querySelector('author_name')?.textContent ?? '',
  userRating: element.querySelector('user_rating')?.textContent ?? '',
  userDateAdded: element.querySelector('user_date_created')?.textContent ?? '',
  userShelves: element.querySelector('user_shelves')?.textContent ?? '',
  userReview: element.querySelector('user_review')?.textContent ?? '',
  averageRating: element.querySelector('average_rating')?.textContent ?? '',
  publicationYear: Number.parseInt(
    element.querySelector('book_published')?.textContent ?? ''
  ),
});

type Item = {
  readonly title: string;
  readonly link: string;
  readonly bookId: string;
  readonly bookImageUrl: string;
  readonly bookSmallImageUrl: string;
  readonly bookMediumImageUrl: string;
  readonly bookLargeImageUrl: string;
  readonly bookDescription: string;
  readonly pageCount: number;
  readonly authorName: string;
  readonly userRating: string;
  readonly userDateAdded: string;
  readonly userShelves: string;
  readonly userReview: string;
  readonly averageRating: string;
  readonly publicationYear: number;
};
