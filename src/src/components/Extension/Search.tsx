import { InputText } from 'primereact/inputtext';
import React from 'react';

import type { IR, R, RA, RR } from '../../utils/types';
import { ensure, filterArray } from '../../utils/types';
import { count, group, sortFunction, sum } from '../../utils/utils';
import type { Book } from '../Foreground/readPages';
import { Books } from './Books';
import { stem } from './stemmer';

export function Search({
  books: allBooks,
  header,
}: {
  readonly books: RA<Book>;
  readonly header: JSX.Element;
}): JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState('');
  const books = useSearch(allBooks, searchQuery.trim());
  return (
    <>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          placeholder="Search"
          value={searchQuery}
          onChange={(event): void => setSearchQuery(event.target.value)}
        />
      </span>
      <Books books={books} header={header} standalone={false} />
    </>
  );
}

function useSearch(allBooks: RA<Book>, searchQuery: string): RA<Book> {
  const bookIndex = React.useMemo(() => index(allBooks), [allBooks]);
  return React.useMemo(
    () =>
      searchQuery.length === 0
        ? allBooks
        : filterBooks(allBooks, bookIndex, searchQuery),
    [bookIndex, allBooks, searchQuery]
  );
}

const searchConfig = ensure<Partial<RR<keyof Book, number>>>()({
  title: 1,
  id: 0.5,
  description: 0.2,
  pageCount: 0.9,
  authorName: 0.9,
  userShelves: 0.3,
  userReview: 0.4,
  publicationYear: 0.4,
} as const);
const searchColumns = Object.keys(searchConfig);

function index(allBooks: RA<Book>): Index {
  // Tokenize and Normalize
  const tokens = allBooks.map((book) =>
    searchColumns.map((column) => ({
      column,
      tokens: tokenize(book[column]?.toString() ?? ''),
    }))
  );

  // Calculate document frequencies
  const allTokens = group(
    tokens.flatMap((book, bookIndex) =>
      book.flatMap(({ tokens }) =>
        tokens.map((token) => [token, bookIndex] as const)
      )
    )
  );
  const frequencies = Object.fromEntries(
    allTokens.map(([token, occurrences]) => [
      token,
      Math.log(allBooks.length / new Set(occurrences).size),
    ])
  );

  // Build an index and normalize it
  const weights = tokens.map((columns) => {
    const index: R<Record<keyof typeof searchConfig, number>> = {};
    columns.forEach(({ column, tokens }) =>
      Object.entries(count(tokens)).forEach(([token, termCount]) => {
        index[token] ??= initialize();
        index[token][column] = termCount;
      })
    );
    const vector = Object.fromEntries(
      Object.entries(index).map(
        ([token, weights]) =>
          [
            token,
            Object.entries(weights)
              .map(
                ([column, termFrequency]) =>
                  termFrequency * frequencies[token] * searchConfig[column]
              )
              .reduce((sum, weight) => sum + weight, 0),
          ] as const
      )
    );
    return normalize(vector);
  });

  return { frequencies, weights };
}

function normalize(vector: IR<number>): IR<number> {
  const size = magnitude(vector);
  return Object.fromEntries(
    Object.entries(vector).map(([token, weight]) => [token, weight / size])
  );
}

const magnitude = (vector: IR<number>): number =>
  Math.sqrt(sum(Object.values(vector).map((weight) => weight ** 2)));

const initialize = (): RR<keyof typeof searchConfig, 0> =>
  Object.fromEntries(searchColumns.map((column) => [column, 0]));

type Index = {
  readonly frequencies: IR<number>;
  readonly weights: RA<IR<number>>;
};

const tokenize = (text: string): RA<string> =>
  text
    .toLowerCase()
    // Remove regex
    .replaceAll(/<[^>]+>/gu, '')
    .trim()
    .split(/[^\da-z]+/u)
    .map(stem)
    .filter(Boolean);

function filterBooks(
  allBooks: RA<Book>,
  { frequencies, weights }: Index,
  searchQuery: string
): RA<Book> {
  const tokens = tokenize(searchQuery);
  const vector = Object.fromEntries(
    filterArray(
      Object.entries(count(tokens)).map(([term, frequency]) =>
        term in frequencies
          ? ([term, frequency * frequencies[term]] as const)
          : undefined
      )
    )
  );
  return weights
    .map((book, bookIndex) => ({
      bookIndex,
      score: cosineSimilarity(vector, book),
    }))
    .sort(sortFunction(({ score }) => score, true))
    .map(({ bookIndex }) => allBooks[bookIndex]);
}

function cosineSimilarity(left: IR<number>, right: IR<number>): number {
  const magnitudes = magnitude(left) * magnitude(right);
  return magnitudes === 0
    ? 0
    : sum(
        Object.entries(left).map(
          ([term, weight]) => (right[term] ?? 0) * weight
        )
      ) / magnitudes;
}

export const exportsForTests = {
  index,
  normalize,
  initialize,
  tokenize,
  filterBooks,
  cosineSimilarity,
  magnitude,
};
