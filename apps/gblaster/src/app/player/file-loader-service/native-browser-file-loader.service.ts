import { inject, Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { ALLOWED_MIMETYPES, FileData } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

interface DirHandleEntry {
  id: number;
  handle: FileSystemDirectoryHandle;
}

@Injectable({
  providedIn: 'root'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  private indexedDbService = inject(NgxIndexedDBService);

  currentFolderHandle?: FileSystemDirectoryHandle;

  async init() {
    const entry = await firstValueFrom(this.indexedDbService.getByID<DirHandleEntry>('dirHandle', 1));
    if (entry) {
      const granted = await verifyPermission(entry.handle);
      if (granted) {
        this.currentFolderHandle = entry.handle;
      }
    }
  }

  async showPicker(): Promise<void> {
    try {
      const handle = await showDirectoryPicker();
      this.currentFolderHandle = handle;
      await this.indexedDbService.update('dirHandle', { id: 1, handle: handle } as DirHandleEntry).toPromise();
    } catch (error) {
      console.log('No files:', error);
    }
  }

  async openFiles(): Promise<FileData[]> {
    if (this.currentFolderHandle) {
      return getAudioFilesFromDirHandle(this.currentFolderHandle);
    }
    return [];
  }
}

async function getAudioFilesFromDirHandle(dirHandle: FileSystemDirectoryHandle): Promise<FileData[]> {
  const fileData: FileData[] = [];
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (ALLOWED_MIMETYPES.includes(file.type)) {
        // TODO: remove double check when accepts works for directories in API
        fileData.push({ file, fileHandle: entry });
      }
    } else {
      const subFiles = await getAudioFilesFromDirHandle(entry);
      fileData.push(...subFiles);
    }
  }
  return fileData;
}

async function verifyPermission(handle: FileSystemDirectoryHandle) {
  // Request permission. If the user grants permission, return true.
  if ((await handle.requestPermission()) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
