export function ensureHttps(url: string): string {
  if (!url) return url;

  try {
    const urlObj = new URL(url);
    urlObj.protocol = 'https:';
    return urlObj.toString();
  } catch {
    console.warn('Invalid URL provided to ensureHttps:', url);
    return url; // Return the original URL if it cannot be parsed
  }
}
