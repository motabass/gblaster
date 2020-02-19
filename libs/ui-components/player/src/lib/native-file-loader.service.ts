import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NativeFileLoaderService {
  currentFolderFiles: File[] = [];

  constructor() {}

  async openFile(): Promise<File> {
    // @ts-ignore
    const fileHandle = await window.chooseFileSystemEntries();
    return await fileHandle.getFile();
  }

  async openFolder(): Promise<boolean> {
    const files: File[] = [];

    try {
      // @ts-ignore
      const handle = await window.chooseFileSystemEntries({ type: 'openDirectory' });
      const entries = await handle.getEntries();

      for await (const entry of entries) {
        if (entry.isFile) {
          const file = await entry.getFile();
          files.push(file);
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
