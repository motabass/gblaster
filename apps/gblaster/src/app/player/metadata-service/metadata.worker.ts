import { Id3CoverPicture, Id3Tags } from './id3-tags.types';
import type { IAudioMetadata } from 'music-metadata';
import { parseBlob } from 'music-metadata';

addEventListener('message', async (event: MessageEvent<{ file: File }>) => {
  if (event.data.file) {
    const tags = await extractTags(event.data.file);
    self.postMessage({ tags: tags });
  }
});

async function extractTags(file: File): Promise<Id3Tags | null> {
  let tags: IAudioMetadata | undefined;
  try {
    tags = await parseBlob(file, {
      duration: false,
      includeChapters: false,
      skipPostHeaders: false,
      skipCovers: false
    });
  } catch (e) {
    console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden: `);
    console.error(e);
    return null;
  }
  let cover: Id3CoverPicture | undefined;

  if (tags.common.picture) {
    cover = { format: tags.common.picture[0].format, data: tags.common.picture[0].data };
  }
  return {
    picture: cover,
    artist: tags.common.artist,
    title: tags.common.title,
    track: tags.common.track,
    album: tags.common.album,
    year: tags.common.year?.toString(),
    format: tags.format
  };
}
