import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import React from 'react';

import { commonText } from '../../localization/common';
import type { GetSet, RA, RR } from '../../utils/types';
import { ensure, writable } from '../../utils/types';
import { Button, Input, Label, Ul } from '../Atoms';
import { Link } from '../Atoms/Link';
import type { Book } from '../Foreground/readPages';

const headers = {
  title: commonText('title'),
  link: undefined,
  id: commonText('id'),
  imageUrl: commonText('image'),
  smallImageUrl: undefined,
  mediumImageUrl: undefined,
  largeImageUrl: undefined,
  description: commonText('description'),
  pageCount: commonText('pageCount'),
  authorName: commonText('authorName'),
  averageRating: commonText('averageRating'),
  userRating: commonText('userRating'),
  userReview: commonText('review'),
  privateNotes: commonText('privateNotes'),
  readTimes: commonText('readTimes'),
  userDateAdded: commonText('dateAdded'),
  userShelves: commonText('shelves'),
  authorLink: undefined,
  publicationYear: commonText('publicationYear'),
  publicationDateData: commonText('publicationDate'),
} as const;
ensure<RR<keyof Book, string | undefined>>()(headers);

const defaultVisible: RR<keyof Book, boolean> = {
  title: true,
  link: false,
  id: false,
  imageUrl: true,
  smallImageUrl: false,
  mediumImageUrl: false,
  largeImageUrl: false,
  description: false,
  pageCount: true,
  authorName: true,
  averageRating: true,
  userRating: true,
  userReview: false,
  readTimes: true,
  privateNotes: false,
  userDateAdded: false,
  userShelves: true,
  authorLink: false,
  publicationYear: true,
  publicationDateData: false,
};

const renderers: Partial<RR<keyof Book, (book: Book) => JSX.Element | string>> =
  {
    id: ({ id, link }) => (
      <Link.Default target="_blank" href={link}>
        {id}
      </Link.Default>
    ),
    title: ({ title, link }) => (
      <Link.Default target="_blank" href={link}>
        {title}
      </Link.Default>
    ),
    imageUrl: ({ imageUrl }) => (
      <img alt="" src={imageUrl} crossOrigin="anonymous" />
    ),
    authorName: ({ authorName, authorLink }) =>
      authorLink === undefined ? (
        authorName
      ) : (
        <Link.Default target="_blank" href={authorLink}>
          {authorName}
        </Link.Default>
      ),
    // FIXME: add UI
    readTimes: ({ readTimes }) => JSON.stringify(readTimes),
  };

export function Books({ books }: { readonly books: RA<Book> }): JSX.Element {
  const visibleColumns = React.useState(() => defaultVisible);
  return (
    <DataTable
      header={<VisibleColumns visibleColumns={visibleColumns} />}
      tableStyle={{ minWidth: '50rem' }}
      value={writable(books)}
      stripedRows
    >
      {Object.entries(headers).map(([key, header]) =>
        header !== undefined && visibleColumns[0][key] ? (
          <Column field={key} header={header} key={key} body={renderers[key]} />
        ) : undefined
      )}
    </DataTable>
  );
}

function VisibleColumns({
  visibleColumns: [visibleColumns, setVisibleColumns],
}: {
  readonly visibleColumns: GetSet<typeof defaultVisible>;
}): JSX.Element {
  const overlayRef = React.useRef<OverlayPanel | null>(null);
  return (
    <>
      <Button.Primary
        onClick={(event): void => overlayRef.current?.toggle(event)}
      >
        {commonText('columns')}
      </Button.Primary>
      <OverlayPanel ref={overlayRef}>
        <Ul>
          {Object.entries(headers).map(([key, header]) =>
            header === undefined ? undefined : (
              <Label.Inline key={key}>
                <Input.Checkbox
                  checked={visibleColumns[key]}
                  onValueChange={(isChecked): void =>
                    setVisibleColumns({
                      ...visibleColumns,
                      [key]: isChecked,
                    })
                  }
                />
                {header}
              </Label.Inline>
            )
          )}
        </Ul>
      </OverlayPanel>
    </>
  );
}
