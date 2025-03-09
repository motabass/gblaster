import { Id3CoverPicture, Id3Tags } from './id3-tags.types';
import { parseBlob } from 'music-metadata';
import { TagsWorkerRequest, TagsWorkerResponse } from './metadata.types';

addEventListener('message', async (event: MessageEvent<TagsWorkerRequest>) => {
  const { id, file } = event.data;

  if (!id || !file) {
    self.postMessage({ id: id || 'unknown', error: 'Invalid request: missing id or file' });
    return;
  }

  try {
    const tags = await extractTags(file);
    self.postMessage({ id, tags } as TagsWorkerResponse);
  } catch (error) {
    let errorMessage = 'Unknown error during tag extraction';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    self.postMessage({ id, error: errorMessage } as TagsWorkerResponse);
  }
});

async function extractTags(file: File): Promise<Id3Tags | undefined> {
  try {
    const tags = await parseBlob(file, {
      duration: false,
      includeChapters: false,
      skipPostHeaders: false,
      skipCovers: false
    });

    let tagsCover: Id3CoverPicture | undefined;
    if (tags.common.picture?.length) {
      tagsCover = { format: tags.common.picture[0].format, data: tags.common.picture[0].data };
    }

    return {
      picture: tagsCover,
      artist: tags.common.artist,
      title: tags.common.title,
      track: tags.common.track,
      album: tags.common.album,
      year: tags.common.year?.toString(),
      format: tags.format
    };
  } catch (error) {
    console.warn(`Tags von "${file.name}" (${file.type}) konnten nicht gelesen werden:`, error);
    return undefined;
  }
}
