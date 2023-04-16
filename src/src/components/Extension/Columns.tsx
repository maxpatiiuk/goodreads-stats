import { FilterMatchMode } from 'primereact/api';
import type { ColumnFilterElementTemplateOptions } from 'primereact/column';
import type {
  DataTableFilterMeta,
  DataTableSortMeta,
} from 'primereact/datatable';
import React from 'react';

import { commonText } from '../../localization/common';
import type { RA, RR } from '../../utils/types';
import { filterArray } from '../../utils/types';
import { Link } from '../Atoms/Link';
import type { Book } from '../Foreground/readPages';

export const columns: RR<
  keyof Book,
  | {
      readonly header: string;
      readonly defaultVisible: boolean;
      readonly defaultFilter: FilterMatchMode | undefined;
      readonly renderer?: (book: Book) => JSX.Element | string;
      readonly filterRenderer?: (
        props: ColumnFilterElementTemplateOptions
      ) => JSX.Element;
      readonly filterField?: string;
    }
  | undefined
> = {
  imageUrl: {
    header: commonText('image'),
    defaultVisible: true,
    defaultFilter: undefined,
    renderer: ({ imageUrl }) => (
      <img alt="" crossOrigin="anonymous" src={imageUrl} />
    ),
  },
  title: {
    header: commonText('title'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.CONTAINS,
    renderer: ({ title, link }) => (
      <Link.Default href={link} target="_blank">
        {title}
      </Link.Default>
    ),
  },
  link: undefined,
  id: {
    header: commonText('id'),
    defaultVisible: false,
    defaultFilter: FilterMatchMode.EQUALS,
    renderer: ({ id, link }) => (
      <Link.Default href={link} target="_blank">
        {id}
      </Link.Default>
    ),
  },
  smallImageUrl: undefined,
  mediumImageUrl: undefined,
  largeImageUrl: undefined,
  description: {
    header: commonText('description'),
    defaultVisible: false,
    defaultFilter: FilterMatchMode.CONTAINS,
    renderer: ({ description }) => (
      <p dangerouslySetInnerHTML={{ __html: description }} />
    ),
  },
  pageCount: {
    header: commonText('originalPageCount'),
    defaultVisible: false,
    defaultFilter: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
  },
  resolvedPageCount: {
    header: commonText('pageCount'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
  },
  authorName: {
    header: commonText('authorName'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.CONTAINS,
    renderer: ({ authorName, authorLink }) =>
      authorLink === undefined ? (
        authorName
      ) : (
        <Link.Default href={authorLink} target="_blank">
          {authorName}
        </Link.Default>
      ),
  },
  averageRating: {
    header: commonText('averageRating'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
  },
  userRating: {
    header: commonText('userRating'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
  },
  userReview: {
    header: commonText('review'),
    defaultVisible: false,
    defaultFilter: FilterMatchMode.CONTAINS,
  },
  privateNotes: {
    header: commonText('privateNotes'),
    defaultVisible: false,
    defaultFilter: FilterMatchMode.CONTAINS,
  },
  readTimes: {
    header: commonText('readTimes'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
    renderer: ({ readTimes }) => (
      <div className="flex flex-col gap-2">
        {readTimes.map(({ start, end }, index) => (
          <div className="flex gap-4" key={index}>
            {start !== undefined && (
              <div>{new Date(start).toLocaleDateString()}</div>
            )}
            {end !== undefined && (
              <>
                -<div>{new Date(end).toLocaleDateString()}</div>
              </>
            )}
          </div>
        ))}
      </div>
    ),
    filterField: 'readTimes.length',
  },
  userDateAdded: {
    header: commonText('dateAdded'),
    defaultVisible: false,
    defaultFilter: FilterMatchMode.BETWEEN,
  },
  userShelves: {
    header: commonText('shelves'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.IN,
  },
  authorLink: undefined,
  publicationYear: {
    header: commonText('publicationYear'),
    defaultVisible: true,
    defaultFilter: FilterMatchMode.BETWEEN,
  },
};

export const defaultFilters: DataTableFilterMeta = Object.fromEntries(
  filterArray(
    Object.entries(columns).map(([key, config]) =>
      config?.defaultFilter === undefined
        ? undefined
        : [
            key,
            {
              operator: 'and',
              constraints: [
                {
                  value: null,
                  matchMode: config.defaultFilter,
                },
              ],
            },
          ]
    )
  )
);

export const defaultSort: RA<DataTableSortMeta> = [
  { field: 'userRating', order: -1 },
  { field: 'title', order: 1 },
];

export const defaultVisible: RA<keyof Book> = Object.entries(columns)
  .filter(([_name, config]) => config?.defaultVisible === true)
  .map(([name]) => name);
