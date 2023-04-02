import { createDictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable @typescript-eslint/naming-convention */
export const commonText = createDictionary({
  goodreadsStats: { 'en-us': 'Goodreads Stats' },
  goodreadsStatsDescription: {
    'en-us':
      'Goodreads extension that adds data export capability and displays extensive analytics about your reading habits.',
  },
  download: { 'en-us': 'Download' },
  downloading: { 'en-us': 'Downloading' },
  filePickerMessage: {
    'en-us': 'Choose a file or drag it here',
  },
  selectedFileName: {
    'en-us': 'Selected file',
  },
  dashboardDescription: {
    'en-us':
      'Open any of your shelfs in Goodreads, and find a "Download" button at the bottom of the screen.',
  },
  dashboardSecondDescription: {
    'en-us':
      'After download process is completed, drag and drop the downloaded file here:',
  },
  unexpectedError: { 'en-us': 'Unexpected error:' },
  tryAgain: {
    'en-us': 'Try again',
  },
  takeoutDate: {
    'en-us': 'Takeout date:',
  },
  books: {
    'en-us': 'Books',
  },
});
/* eslint-enable @typescript-eslint/naming-convention */
