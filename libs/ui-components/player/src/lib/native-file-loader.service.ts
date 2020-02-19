import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NativeFileLoaderService {
  constructor() {}

  async openFile(): Promise<File> {
    // @ts-ignore
    const fileHandle = await window.chooseFileSystemEntries();
    return await fileHandle.getFile();
  }

  async openFolder(): Promise<File[]> {
    const files: File[] = [];
    // @ts-ignore
    const handle = await window.chooseFileSystemEntries({ type: 'openDirectory' });
    const entries = await handle.getEntries();
    for await (const entry of entries) {
      if (entry.isFile) {
        const file = await entry.getFile();
        files.push(file);
      }
    }
    return files;
  }
}
