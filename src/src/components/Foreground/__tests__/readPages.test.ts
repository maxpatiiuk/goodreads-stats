import { theories } from '../../../tests/utils';
import { exportsForTests } from '../readPages';

const { properlyEscape: escape } = exportsForTests;

function properlyEscape(string: string): string {
  return JSON.parse(`"${escape(string)}"`);
}

theories(properlyEscape, [
  {
    name: 'Correct string',
    in: ['\\b\\n\\r\\t\\f\\"\\\\'],
    out: '\b\n\r\t\f"\\',
  },
  {
    name: 'Unescaped string',
    in: ['\b\n\r\t\f\\"\\\\'],
    out: '\b\n\r\t\f"\\',
  },
  {
    name: 'HTML Tag',
    in: ['<\\\\/a>'],
    out: '<\\/a>',
  },
]);
