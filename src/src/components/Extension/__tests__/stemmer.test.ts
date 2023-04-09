import { stem } from '../stemmer';
import stemmerTest from './stemmer.json';

/**
 * Test cases are coming from https://tartarus.org/martin/PorterStemmer/voc.txt
 * and https://tartarus.org/martin/PorterStemmer/output.txt
 */
stemmerTest.forEach(([input, output]) =>
  test(`${input} -> ${output}`, () => expect(stem(input)).toBe(output))
);
