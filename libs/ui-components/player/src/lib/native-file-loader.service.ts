import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NativeFileLoaderService {
  constructor() {
  }

  async openFile(): Promise<File> {
    // @ts-ignore
    const fileHandle = await window.chooseFileSystemEntries();
    return await fileHandle.getFile();
  }
}
