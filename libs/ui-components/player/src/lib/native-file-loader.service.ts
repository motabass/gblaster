import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NativeFileLoaderService {
  currentFolderFiles: File[] = [];

  currentDirHandle: any;

  constructor() {}

  async openFile(): Promise<File> {
    // @ts-ignore
    const fileHandle = await window.chooseFileSystemEntries();
    return await fileHandle.getFile();
  }

  async openFolder(): Promise<boolean> {
    const allowedTypes = ['audio/mp3'];

    const files: File[] = [];

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
            files.push(file);
          }
        }
      }
    } catch (e) {
      console.log(e.message);
      return false;
    }

    this.currentFolderFiles = files;
    return true;
  }
}
