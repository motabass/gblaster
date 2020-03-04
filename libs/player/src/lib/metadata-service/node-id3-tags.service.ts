import { Injectable } from '@angular/core';
import { PictureType } from 'jsmediatags/types';
import { ElectronService } from 'ngx-electron';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class NodeId3TagsService extends ID3TagsService {
  constructor(private electronService: ElectronService) {
    super();
    console.log('Using node metadata service...');
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
    const tags = await this.electronService.ipcRenderer.invoke('GET_ID3_TAGS', file.path);

    if (!tags) {
      return null;
    }

    let cover: PictureType | undefined;

    if (tags.tags?.picture) {
      cover = tags.tags.picture.data;
    }
    return {
      picture: cover,
      artist: tags?.tags?.artist,
      title: tags?.tags?.title,
      track: tags?.tags?.track,
      album: tags?.tags?.album,
      year: tags?.tags?.year
    };
  }
}
