import { TabPanel, TabView } from 'primereact/tabview';
import React from 'react';

import { commonText } from '../../localization/common';
import { Button, ErrorMessage } from '../Atoms';
import type { Takeout } from '../Foreground/readPages';
import { DateElement } from '../Molecules/DateElement';
import { FilePicker, fileToText } from '../Molecules/FilePicker';
import { Books } from './Books';
import { Charts } from './Charts';
import { Search } from './Search';

export function App(): JSX.Element | null {
  const [data, setData] = React.useState<Takeout | string | undefined>(
    undefined
  );
  return (
    <div className="flex flex-col gap-4 p-8 md:h-screen">
      <h1 className="text-2xl">{commonText('goodreadsStats')}</h1>
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
    </div>
  );
}

function Dashboard({ takeout }: { readonly takeout: Takeout }): JSX.Element {
  const header = <h2 className="text-xl">{takeout.description}</h2>;
  return (
    <>
      <p>
        {commonText('lastUpdated')}
        <DateElement date={takeout.lastBuildDate} />
      </p>
      <TabView className="contents" panelContainerClassName="contents">
        <TabPanel
          className="contents"
          header={commonText('stats')}
          {...bugProps}
        >
          <Charts books={takeout.books} />
        </TabPanel>
        <TabPanel
          className="contents"
          header={commonText('allBooks')}
          {...bugProps}
        >
          <Books books={takeout.books} header={header} standalone />
        </TabPanel>
        <TabPanel
          className="contents"
          header={commonText('search')}
          {...bugProps}
        >
          <Search books={takeout.books} header={header} />
        </TabPanel>
      </TabView>
    </>
  );
}

/**
 * There is a bug in PrimeReact's TypeScript typing that requires adding these
 * internal attributes
 */
const bugProps = {
  prevButton: undefined,
  nextButton: undefined,
  closeIcon: undefined,
} as const;
