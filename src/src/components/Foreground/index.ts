import '../../css/foreground.css';

import { commonText } from '../../localization/common';
import { formatNumber } from '../Atoms/Internationalization';
import { downloadFile } from '../Molecules/FilePicker';
import { readPages } from './readPages';

const footer = document.querySelector('#pagestuff .buttons') ?? undefined;
if (footer === undefined) throw new Error('Unable to locate the page footer');

const rssLink = Array.from(footer.querySelectorAll('a')).find(({ href }) =>
  href?.includes('rss')
)?.href;
if (rssLink === undefined) throw new Error('Unable to locate the RSS link');

// Using link rather than button to piggy back on GoodRead's styling
const downloadLink = document.createElement('a');
// Making it be interpreted as a link for accessibility
downloadLink.role = 'button';
downloadLink.classList.add('cursor-pointer', 'mr-[5px]');
downloadLink.textContent = commonText('download');
downloadLink.addEventListener('click', () => {
  const total = getTotal();
  const { cleanup, updateProgress, crash } = displayDialog(total);

  readPages(rssLink, updateProgress)
    .then(async (data) =>
      downloadFile(`${data.description}.json`, JSON.stringify(data, null, 4))
    )
    .then(cleanup)
    .catch((error) => {
      crash(error.message);
      console.error(error);
    });
});
footer.prepend(downloadLink);

function getTotal(): number {
  const shelfName = document.querySelector(
    '#shelvesSection .selectedShelf'
  )?.textContent;
  const trimmed =
    typeof shelfName === 'string'
      ? shelfName.slice(shelfName.lastIndexOf('(')).replaceAll(/\D+/gu, '')
      : '';
  const number = Number.parseInt(trimmed);
  if (Number.isNaN(number))
    console.error('Unable to locate the total number of books on a shelf');
  const fallbackTotal = 1000;
  return Number.isNaN(number) ? fallbackTotal : number;
}

/**
 * Display the download progress dialog
 */
function displayDialog(total: number): {
  readonly cleanup: () => void;
  readonly crash: (message: string) => void;
  readonly updateProgress: (progress: number) => void;
} {
  const dialog = document.createElement('dialog');
  dialog.classList.add('download-dialog');
  document.body.append(dialog);
  const h1 = document.createElement('h1');
  h1.textContent = commonText('downloading');
  dialog.append(h1);
  const progress = document.createElement('progress');
  progress.classList.add('w-full');
  progress.setAttribute('max', total.toString());
  const progressText = document.createElement('p');
  progressText.classList.add('text-center');
  progressText.setAttribute('aria-hidden', true.toString());

  function updateProgress(count: number): void {
    progress.setAttribute('value', count.toString());
    const formatted = `${formatNumber(count)}/${formatNumber(total)}`;
    progress.textContent = formatted;
    progressText.textContent = formatted;
  }

  updateProgress(0);
  dialog.append(progress);
  dialog.append(progressText);
  dialog.showModal();

  const cleanup = (): void => dialog.remove();

  function crash(message: string): void {
    progressText.textContent = message;
    progressText.innerHTML = `${commonText('unexpectedErrorOccurred')}<br>${
      progressText.innerHTML
    }`;
    progress.remove();
    const close = document.createElement('button');
    close.textContent = commonText('close');
    close.addEventListener('click', cleanup);
    dialog.append(close);
  }

  return { cleanup, updateProgress, crash };
}
