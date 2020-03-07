import { Injectable } from '@angular/core';
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

    console.log(tags);

    // if (!tags) {
    //   return null;
    // }
    //
    // let cover: PictureType | undefined;
    //
    // if (tags.tags?.picture) {
    //   cover = tags.tags.picture.data;
    // }
    return {
      // picture: cover,
      artist: tags?.artist,
      title: tags?.title,
      track: tags?.track,
      album: tags?.album,
      year: tags?.year
    };
  }
}
