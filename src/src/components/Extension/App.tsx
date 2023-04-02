import React from 'react';
import { commonText } from '../../localization/common';
import { Book, Takeout } from '../Foreground/readPages';
import { FilePicker, fileToText } from '../Molecules/FilePicker';
import { Button, ErrorMessage } from '../Atoms';
import { DateElement } from '../Molecules/DateElement';
import { RA } from '../../utils/types';

export function App(): JSX.Element | null {
  const [data, setData] = React.useState<string | Takeout | undefined>(
    undefined
  );
  return (
    <>
      <h1>{commonText('goodreadsStats')}</h1>
      {data === undefined ? (
        <>
          <p>{commonText('goodreadsStatsDescription')}</p>
          <p>{commonText('dashboardDescription')}</p>
          <p>{commonText('dashboardSecondDescription')}</p>
          <FilePicker
            acceptedFormats={['.json']}
            onSelected={(file): void =>
              void fileToText(file)
                .then((text) => JSON.parse(text))
                .catch((error) => setData(error.message))
            }
          />
        </>
      ) : typeof data === 'string' ? (
        <>
          <ErrorMessage>
            {commonText('unexpectedError')}
            {data}
          </ErrorMessage>
          <Button.Primary onClick={(): void => setData(undefined)}>
            {commonText('tryAgain')}
          </Button.Primary>
        </>
      ) : (
        <Dashboard takeout={data} />
      )}
    </>
  );
}

export function Dashboard({
  takeout,
}: {
  readonly takeout: Takeout;
}): JSX.Element {
  return (
    <>
      <h2>{takeout.description}</h2>
      <p>
        {commonText('takeoutDate')}
        <DateElement date={takeout.lastBuildDate} />
      </p>
      <h3>
        {commonText('books')}
        <Books books={takeout.books} />
      </h3>
    </>
  );
}

export function Books({ books }: { readonly books: RA<Book> }): JSX.Element {}
