/// <reference types="wicg-file-system-access" />

import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { ALLOWED_MIMETYPES } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'root'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  currentFolderHandle?: FileSystemDirectoryHandle;

  constructor(private indexedDbService: NgxIndexedDBService) {
    super();
  }

  async init() {
    const entry = await firstValueFrom(this.indexedDbService.getByID<any>('dirHandle', 1));
    if (entry) {
      const granted = await verifyPermission(entry.handle);
      if (granted) {
        this.currentFolderHandle = entry.handle;
      }
    }
  }

  async showPicker(): Promise<void> {
    try {
      const handle = await window.showDirectoryPicker();
      this.currentFolderHandle = handle;
      await this.indexedDbService.update('dirHandle', { id: 1, handle: handle }).toPromise();
    } catch (err) {
      console.log('No files: ', err);
    }
  }

  async openFiles(): Promise<File[]> {
    if (this.currentFolderHandle) {
      return this.readHandle(this.currentFolderHandle);
    }
    return [];
  }

  private async readHandle(handle: FileSystemDirectoryHandle): Promise<File[]> {
    return await getAudioFilesFromDirHandle(handle);
  }
}

async function getAudioFilesFromDirHandle(dirHandle: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  // @ts-ignore
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

async function verifyPermission(handle: FileSystemDirectoryHandle) {
  // Check if permission was already granted. If so, return true.
  // @ts-ignore
  if ((await handle.queryPermission()) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  // @ts-ignore
  if ((await handle.requestPermission()) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
