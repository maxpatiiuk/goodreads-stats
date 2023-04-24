import 'primeicons/primeicons.css';
import 'primereact/resources/themes/viva-light/theme.css';
import 'primereact/resources/primereact.css';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import { f } from '../../utils/functools';
import type { GetSet, RA } from '../../utils/types';
import { writable } from '../../utils/types';
import { debounce, multiSortFunction } from '../../utils/utils';
import { Button, Input, Label, Ul } from '../Atoms';
import type { Book } from '../Foreground/readPages';
import { dateColumns, numericColumns } from '../Foreground/readPages';
import {
  columns,
  defaultFilters,
  defaultSort,
  defaultVisible,
} from './Columns';

const throttleRate = 1000;

export function Books({
  books,
  header,
  standalone,
}: {
  readonly books: RA<Book>;
  readonly header: JSX.Element;
  readonly standalone: boolean;
}): JSX.Element | null {
  const [state, setState] = useStorage('primeVue');
  const throttledSet = React.useMemo(
    () => debounce(setState, throttleRate),
    [setState]
  );
  const [visibleColumns = defaultVisible, setVisibleColumns] =
    useStorage('visibleColumns');
  return state === undefined ? null : (
    <DataTable
      className="!h-0 flex-1"
      customRestoreState={(): object | undefined =>
        state === false ? undefined : state
      }
      customSaveState={throttledSet}
      dataKey="id"
      emptyMessage={commonText('noBooksFound')}
      filterDisplay="menu"
      filters={defaultFilters}
      header={
        <div className="flex gap-2">
          {header}
          <span className="-ml-2 flex-1" />
          <VisibleColumns
            visibleColumns={[visibleColumns, setVisibleColumns]}
            tableState={state}
          />
        </div>
      }
      multiSortMeta={standalone ? writable(defaultSort) : undefined}
      removableSort={standalone}
      reorderableColumns
      scrollable
      scrollHeight="flex"
      sortMode={standalone ? 'multiple' : undefined}
      stateStorage={standalone ? 'custom' : undefined}
      stripedRows
      tableStyle={{ minWidth: '50rem' }}
      value={writable(books)}
    >
      {Object.entries(columns).map(([key, config]) =>
        config !== undefined && visibleColumns.includes(key) ? (
          <Column
            body={config.renderer}
            dataType={
              f.includes(numericColumns, key)
                ? 'numeric'
                : f.includes(dateColumns, key)
                ? 'date'
                : 'text'
            }
            field={key}
            filter={config.defaultFilter !== undefined}
            filterField={config.filterField}
            header={config.header}
            key={key}
            sortable
          />
        ) : undefined
      )}
    </DataTable>
  );
}

const allColumns = Object.keys(columns);

// FIXME: take a look at 2 bugs (screenshots)
function VisibleColumns({
  visibleColumns: [visibleColumns, setVisibleColumns],
  tableState: state,
}: {
  readonly tableState: object | false;
  readonly visibleColumns: GetSet<RA<keyof Book>>;
}): JSX.Element {
  const overlayRef = React.useRef<OverlayPanel | null>(null);
  const rawColumnOrder =
    typeof state === 'object' &&
    'columnOrder' in state &&
    Array.isArray(state.columnOrder)
      ? state.columnOrder
      : undefined;
  const columnOrder = React.useMemo<RA<keyof Book>>(
    () =>
      rawColumnOrder === undefined
        ? allColumns
        : Array.from(Object.keys(columns)).sort(
            multiSortFunction(
              (column) => {
                const index = rawColumnOrder.indexOf(column);
                return index === -1 ? rawColumnOrder.length : index;
              },
              (column) => allColumns.indexOf(column)
            )
          ),
    [rawColumnOrder]
  );
  return (
    <>
      <Button.Primary
        onClick={(event): void => overlayRef.current?.toggle(event)}
      >
        {commonText('columns')}
      </Button.Primary>
      <OverlayPanel ref={overlayRef}>
        <Ul>
          {columnOrder.map((header) =>
            columns[header] === undefined ? undefined : (
              <Label.Inline key={header}>
                <Input.Checkbox
                  checked={f.includes(visibleColumns, header)}
                  onValueChange={(isChecked): void =>
                    setVisibleColumns(
                      isChecked
                        ? [...visibleColumns, header]
                        : visibleColumns.filter((column) => column !== header)
                    )
                  }
                />
                {columns[header]?.header}
              </Label.Inline>
            )
          )}
        </Ul>
      </OverlayPanel>
    </>
  );
}
