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
