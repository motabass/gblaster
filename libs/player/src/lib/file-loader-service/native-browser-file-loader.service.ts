import { Injectable } from '@angular/core';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'any'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  private currentFolderFileHandles: any[] = [];

  constructor() {
    super();
  }

  async openFolder(): Promise<File[]> {
    const allowedTypes = ['audio/mp3'];

    const fileHandles: any[] = [];

    const opts = {
      type: 'openDirectory',
      accepts: [
        {
          description: 'Musikdateien (mp3)',
          extensions: ['mp3'],
          mimeTypes: ['audio/mp3']
        }
      ]
    };

    try {
      // @ts-ignore
      const handle = await window.chooseFileSystemEntries(opts);

      for await (const entry of handle.getEntries()) {
        if (entry.isFile) {
          const file = await entry.getFile();
          if (allowedTypes.includes(file.type)) {
            fileHandles.push(entry);
          }
        }
      }
    } catch (e) {
      console.log(e.message);
      return [];
    }

    this.currentFolderFileHandles = fileHandles;
    return this.getFiles();
  }

  async getFiles(): Promise<File[]> {
    const files: any[] = [];
    for (const handle of this.currentFolderFileHandles) {
      const file = await handle.getFile();
      files.push(file);
    }
    return files;
  }
}
