/// <reference types="wicg-file-system-access" />

import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ALLOWED_MIMETYPES } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'any'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  currentFolderHandle?: FileSystemDirectoryHandle;

  constructor(private indexedDbService: NgxIndexedDBService) {
    super();
    this.init();
  }

  async init() {
    const entries = await this.indexedDbService.getAll('dirHandle').toPromise();
    if (entries.length) {
      const granted = await verifyPermission(entries[0].handle);
      if (granted) {
        this.currentFolderHandle = entries[0].handle;
      }
    }
  }

  async showPicker(): Promise<void> {
    const handle = await window.showDirectoryPicker();
    this.currentFolderHandle = handle;
    this.indexedDbService.clear('dirHandle');
    this.indexedDbService.add('dirHandle', { handle: handle });
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
  if ((await handle.queryPermission()) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await handle.requestPermission()) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
