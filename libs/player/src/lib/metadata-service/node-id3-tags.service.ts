import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ID3TagsService } from './id3-tags.service.abstract';
import { Id3Tags } from './id3-tags.types';

@Injectable()
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

    this.electronService.ipcRenderer.once('extractId3Tags', (event, data: string) => {
      console.log('Antwort bekommen: ', data);
    });
    return null;
  }
}
