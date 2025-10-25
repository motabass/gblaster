import { ensureHttps } from './metadata-helper';

describe('ensureHttps', () => {
  it('should convert http to https', () => {
    const result = ensureHttps('http://example.com');
    expect(result).toBe('https://example.com/');
  });

  it('should keep https as is', () => {
    const result = ensureHttps('https://example.com');
    expect(result).toBe('https://example.com/');
  });

  it('should handle urls with paths', () => {
    const result = ensureHttps('http://example.com/path/to/resource');
    expect(result).toBe('https://example.com/path/to/resource');
  });

  it('should handle urls with query parameters', () => {
    const result = ensureHttps('http://example.com?param=value');
    expect(result).toBe('https://example.com/?param=value');
  });

  it('should handle urls with fragments', () => {
    const result = ensureHttps('http://example.com#section');
    expect(result).toBe('https://example.com/#section');
  });

  it('should handle urls with ports', () => {
    const result = ensureHttps('http://example.com:8080');
    expect(result).toBe('https://example.com:8080/');
  });

  it('should return original url if it cannot be parsed', () => {
    const invalidUrl = 'not a valid url';
    const result = ensureHttps(invalidUrl);
    expect(result).toBe(invalidUrl);
  });

  it('should return original url if empty', () => {
    const result = ensureHttps('');
    expect(result).toBe('');
  });

  it('should handle urls with username and password', () => {
    const result = ensureHttps('http://user:pass@example.com');
    expect(result).toBe('https://user:pass@example.com/');
  });

  it('should handle complex urls', () => {
    const result = ensureHttps('http://user:pass@example.com:8080/path?query=1#hash');
    expect(result).toBe('https://user:pass@example.com:8080/path?query=1#hash');
  });
});
