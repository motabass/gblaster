export function ensureHttps(url: string): string {
  return url?.replace(/^http:\/\//i, 'https://');
}
