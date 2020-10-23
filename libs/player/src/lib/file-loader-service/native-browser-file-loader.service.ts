/// <reference types="wicg-file-system-access" />

import { Injectable } from '@angular/core';
import { ALLOWED_MIMETYPES } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'any'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  private currentFolderHandle?: FileSystemDirectoryHandle;

  constructor() {
    super();
  }

  async openFiles(): Promise<File[]> {
    const handle = await window.showDirectoryPicker();
    this.currentFolderHandle = handle;
    return await getAudioFilesFromDirHandle(handle);
  }
}

async function getAudioFilesFromDirHandle(dirHandle: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (ALLOWED_MIMETYPES.includes(file.type)) {
        // TODO: remove double check when accepts works for directories in API
        files.push(file);
      }
    } else {
      const subFiles = await getAudioFilesFromDirHandle(entry);
      files.push(...subFiles);
    }
  }
  return files;
}
