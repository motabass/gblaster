import { inject, Injectable, signal } from '@angular/core';
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
export class NativeBrowserFileLoaderService implements FileLoaderService {
  private readonly indexedDbService = inject(NgxIndexedDBService);

  readonly currentFolderHandle = signal<FileSystemDirectoryHandle | undefined>(undefined);

  constructor() {
    //  TODO: refactor
    firstValueFrom(this.indexedDbService.getByID<DirHandleEntry>('directoryHandles', 1)).then((entry) => {
      if (entry) {
        verifyPermission(entry.handle).then((granted) => {
          if (granted) {
            this.currentFolderHandle.set(entry.handle);
          }
        });
      }
    });
  }

  async showPicker(): Promise<void> {
    try {
      const handle = await showDirectoryPicker();
      this.currentFolderHandle.set(handle);
      await firstValueFrom(this.indexedDbService.update('directoryHandles', { id: 1, handle: handle } as DirHandleEntry));
    } catch (error) {
      console.log('No files:', error);
    }
  }

  async openFiles(): Promise<FileData[]> {
    const handle = this.currentFolderHandle();
    if (handle) {
      return getAudioFilesFromDirHandle(handle);
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
  return (await handle.requestPermission()) === 'granted';
}
