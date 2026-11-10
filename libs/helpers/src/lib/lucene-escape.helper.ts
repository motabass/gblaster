/**
Escapes Lucene special characters so a string can be used as a query value.
@param queryString Text to escape.
@returns The query string with each special character escaped.
*/
export function escapeLuceneQueryString(queryString: string): string {
  const specialChars = new Set([
    '+',
    '-',
    '&',
    '|',
    '!',
    '(',
    ')',
    '{',
    '}',
    '[',
    ']',
    '^',
    '"',
    '~',
    '*',
    '?',
    ':',
    '\\'
  ]);

  return [...queryString].map((char) => (specialChars.has(char) ? `\\${char}` : char)).join('');
}
