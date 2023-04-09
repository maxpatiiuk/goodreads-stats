import { Books } from './Books';
import React from 'react';
import { RA } from '../../utils/types';
import { Book } from '../Foreground/readPages';
import { InputText } from 'primereact/inputtext';

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
      <Books
        books={books}
        header={<h2 className="text-xl">{header}</h2>}
        standalone={false}
      />
    </>
  );
}

function useSearch(allBooks: RA<Book>, searchQuery: string): RA<Book> {
  return React.useMemo(
    () =>
      searchQuery.length === 0 ? allBooks : filterBooks(allBooks, searchQuery),
    [allBooks, searchQuery]
  );
}

function filterBooks(allBooks: RA<Book>, searchQuery: string): RA<Book> {}
