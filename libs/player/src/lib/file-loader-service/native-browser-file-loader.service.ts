import { Injectable } from '@angular/core';
import { ALLOWED_EXTENSIONS, ALLOWED_FILETYPES } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'any'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  private currentFolderFileHandles: any[] = [];

  constructor() {
    super();
  }

  async openFiles(): Promise<File[]> {
    const allowedTypes = ALLOWED_FILETYPES;

    const fileHandles: any[] = [];

    const opts = {
      type: 'openDirectory',
      recursive: true,
      accepts: [
        {
          description: 'Musikdateien (mp3)',
          extensions: ALLOWED_EXTENSIONS,
          mimeTypes: ALLOWED_FILETYPES
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
