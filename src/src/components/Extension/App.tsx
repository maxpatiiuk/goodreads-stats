import React from 'react';

import { commonText } from '../../localization/common';
import { Button, ErrorMessage } from '../Atoms';
import type { Takeout } from '../Foreground/readPages';
import { DateElement } from '../Molecules/DateElement';
import { FilePicker, fileToText } from '../Molecules/FilePicker';
import { Books } from './Books';

export function App(): JSX.Element | null {
  const [data, setData] = React.useState<Takeout | string | undefined>(
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
                .then(setData)
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

function Dashboard({ takeout }: { readonly takeout: Takeout }): JSX.Element {
  return (
    <>
      <h2>{takeout.description}</h2>
      <p>
        {commonText('lastUpdated')}
        <DateElement date={takeout.lastBuildDate} />
      </p>
      <h3>
        {commonText('books')}
        <Books books={takeout.books} />
      </h3>
    </>
  );
}
