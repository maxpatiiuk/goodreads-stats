import '../../css/foreground.css';

import { commonText } from '../../localization/common';
import { readPages } from './readPages';
import { downloadFile } from '../Molecules/FilePicker';

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
  const { cleanup, updateProgress } = displayDialog(total);

  readPages(rssLink, updateProgress)
    .then(async (data) =>
      downloadFile(`${data.description}.json`, JSON.stringify(data, null, 4))
    )
    .then(cleanup)
    .catch(console.error);
});
footer.prepend(downloadLink);

function getTotal(): number {
  const totalString = Number.parseInt(
    document
      .querySelector('#header .h1Shelf .greyText')
      ?.textContent?.replaceAll(/\D+/gu, '') ?? ''
  );
  if (Number.isNaN(totalString))
    console.error('Unable to locate the total number of books on a shelf');
  const fallbackTotal = 1000;
  return Number.isNaN(totalString) ? fallbackTotal : totalString;
}

/**
 * Display the download progress dialog
 */
function displayDialog(total: number): {
  readonly cleanup: () => void;
  readonly updateProgress: (progress: number) => void;
} {
  const dialog = document.createElement('dialog');
  dialog.classList.add('download-dialog');
  document.body.append(dialog);
  const h1 = document.createElement('h1');
  h1.textContent = commonText('downloading');
  dialog.append(h1);
  const progress = document.createElement('progress');
  progress.setAttribute('max', total.toString());

  function updateProgress(percentage: number): void {
    progress.setAttribute('value', percentage.toString());
    progress.textContent = `${percentage}%`;
  }

  updateProgress(0);
  dialog.append(progress);
  dialog.showModal();

  const cleanup = (): void => void dialog.remove();

  return { cleanup, updateProgress };
}
