import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'any' })
export class NodeId3TagsService extends ID3TagsService {
  constructor(private electronService: ElectronService) {
    super();
    console.log('Using Node metadata');
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
    const start = performance.now();
    // @ts-ignore
    const buffer = await file.arrayBuffer();
    console.log('Creating array buffer took: ', performance.now() - start);
    this.electronService.ipcRenderer.send('extractId3Tags', buffer);

    // TODO: extract id3tags

    // this.electronService.ipcRenderer.send('extractId3Tags', fileBuffer);
    //
    // this.electronService.ipcRenderer.once('extractId3Tags', (event, data: string) => {
    //   console.log('Antwort bekommen: ', data);
    // });
    return null;
  }
}
