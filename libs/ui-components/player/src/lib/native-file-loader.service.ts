import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NativeFileLoaderService {
  currentFolderFileHandles: unknown[] = [];

  currentDirHandle: unknown;

  constructor() {}

  async openFolder(): Promise<boolean> {
    const allowedTypes = ['audio/mp3'];

    const fileEntries: unknown[] = [];

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

      this.currentDirHandle = handle;
      for await (const entry of handle.getEntries()) {
        if (entry.isFile) {
          const file = await entry.getFile();
          if (allowedTypes.includes(file.type)) {
            fileEntries.push(entry);
          }
        }
      }
    } catch (e) {
      console.log(e.message);
      return false;
    }

    this.currentFolderFileHandles = fileEntries;
    return true;
  }
}
