import { theories } from '../../../tests/utils';
import type { RA } from '../../../utils/types';
import type { Book } from '../../Foreground/readPages';
import { exportsForTests } from '../Search';
import books from './books.json';

const {
  index,
  normalize,
  initialize,
  tokenize,
  filterBooks,
  cosineSimilarity,
  magnitude,
} = exportsForTests;

theories(initialize, [
  {
    in: [],
    out: {
      title: 0,
      id: 0,
      description: 0,
      pageCount: 0,
      authorName: 0,
      userShelves: 0,
      userReview: 0,
      publicationYear: 0,
    },
  },
]);

theories(normalize, [
  {
    in: [{ a: 1, b: 2, c: 3 }],
    out: {
      a: 0.267_261_241_912_424_4,
      b: 0.534_522_483_824_848_8,
      c: 0.801_783_725_737_273_2,
    },
  },
]);

theories(tokenize, [
  {
    in: ['This is a test of a (tokenizer)'],
    out: ['thi', 'is', 'a', 'test', 'of', 'a', 'token'],
  },
  {
    in: [
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
    ],
    out: [
      'lorem',
      'ipsum',
      'is',
      'simpli',
      'dummi',
      'text',
      'of',
      'the',
      'print',
      'and',
      'typeset',
      'industri',
      'lorem',
      'ipsum',
      'ha',
      'been',
      'the',
      'industri',
      's',
      'standard',
      'dummi',
      'text',
      'ever',
      'sinc',
      'the',
      '1500',
      'when',
      'an',
      'unknown',
      'printer',
      'took',
      'a',
      'gallei',
      'of',
      'type',
      'and',
      'scrambl',
      'it',
      'to',
      'make',
      'a',
      'type',
      'specimen',
      'book',
    ],
  },
]);

theories(cosineSimilarity, [
  {
    in: [{}, {}],
    out: 0,
  },
  {
    in: [{ a: 1 }, { b: 2 }],
    out: 0,
  },
  {
    in: [{ a: 1 }, { a: 1, b: 2 }],
    out: 0.447_213_595_499_957_9,
  },
  {
    in: [
      { a: 1, c: 3 },
      { a: 0.5, b: 2 },
    ],
    out: 0.076_696_498_884_737_04,
  },
]);

theories(magnitude, [
  { in: [{ 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }], out: 7.416_198_487_095_663 },
]);

const allBooks = books as RA<Book>;
const indexed = index(allBooks);
test('index', () => expect(indexed).toMatchSnapshot());
const searchQueries = [
  'All our wrong todays',
  'Elon Musk',
  'Echo',
  'Life',
  'Educated',
  "(the) Mysterious don't have to",
  'space saga',
  'carbon to-read',
];
describe('filterBooks', () =>
  void searchQueries.forEach((query) =>
    test(query, () =>
      expect(
        filterBooks(allBooks, indexed, query)
          .slice(0, 10)
          .map(({ title }) => title)
      ).toMatchSnapshot()
    )
  ));
