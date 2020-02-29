import { Id3Tags } from './id3-tags.types';

export abstract class ID3TagsService {
  abstract async extractTags(file: File): Promise<Id3Tags | null>;
}
