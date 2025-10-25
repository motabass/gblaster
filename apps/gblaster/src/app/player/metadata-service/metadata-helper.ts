import { md5 } from '@noble/hashes/legacy.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { Vibrant } from 'node-vibrant/browser';
import type { CoverColorPalette } from './metadata.types';

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

/**
 * Generates a hash for a file by sampling strategic portions of its content
 * @param file The file to hash
 * @returns A hex string representing the hash of the file
 */
export async function generateFileHash(file: File): Promise<string> {
  const fileSize = file.size;

  // For very small files, hash the entire content
  if (fileSize <= 256 * 1024) {
    // 256KB or less
    const buffer = await file.arrayBuffer();
    return bytesToHex(md5(new Uint8Array(buffer)));
  }

  // Choose smaller chunk size based on file size
  const chunkSize = fileSize < 5 * 1024 * 1024 ? 64 * 1024 : 128 * 1024; // 64KB or 128KB

  const chunks: Uint8Array[] = [];

  // First chunk - contains headers in audio files
  const firstChunk = await file.slice(0, chunkSize).arrayBuffer();
  chunks.push(new Uint8Array(firstChunk));

  // For files larger than 1MB, sample the middle
  if (fileSize > 1024 * 1024) {
    const middlePos = Math.floor(fileSize / 2) - Math.floor(chunkSize / 2);
    const middleChunk = await file.slice(middlePos, middlePos + chunkSize).arrayBuffer();
    chunks.push(new Uint8Array(middleChunk));
  }

  // For files larger than 8MB, add quarter and three-quarter samples
  if (fileSize > 8 * 1024 * 1024) {
    const quarterPos = Math.floor(fileSize * 0.25);
    const quarterChunk = await file.slice(quarterPos, quarterPos + chunkSize).arrayBuffer();
    chunks.push(new Uint8Array(quarterChunk));

    const threeQuarterPos = Math.floor(fileSize * 0.75);
    const threeQuarterChunk = await file.slice(threeQuarterPos, threeQuarterPos + chunkSize).arrayBuffer();
    chunks.push(new Uint8Array(threeQuarterChunk));
  }

  // Last chunk - often contains important metadata in audio files
  const endChunk = await file.slice(Math.max(0, fileSize - chunkSize), fileSize).arrayBuffer();
  chunks.push(new Uint8Array(endChunk));

  // Combine all chunks into one array
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return bytesToHex(md5(combined));
}

/**
 * Extracts a color palette from an image URL using node-vibrant
 * @param url The URL of the image to extract colors from
 * @returns A color palette or undefined if extraction fails
 */
export async function extractColorsWithNodeVibrant(url: string): Promise<CoverColorPalette | undefined> {
  try {
    const palette = await Vibrant.from(url).getPalette();
    return {
      vibrant: {
        hex: palette.Vibrant?.hex,
        textHex: palette.Vibrant?.titleTextColor
      },
      darkVibrant: {
        hex: palette.DarkVibrant?.hex,
        textHex: palette.DarkVibrant?.titleTextColor
      },
      lightVibrant: {
        hex: palette.LightVibrant?.hex,
        textHex: palette.LightVibrant?.titleTextColor
      },
      muted: {
        hex: palette.Muted?.hex,
        textHex: palette.Muted?.titleTextColor
      },
      darkMuted: {
        hex: palette.DarkMuted?.hex,
        textHex: palette.DarkMuted?.titleTextColor
      },
      lightMuted: {
        hex: palette.LightMuted?.hex,
        textHex: palette.LightMuted?.titleTextColor
      }
    };
  } catch (error) {
    console.error('Error extracting colors with Vibrant:', error);
    return undefined;
  }
}
