import { inject, Injectable, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
import { ALLOWED_MIMETYPES, FileData } from './file-loader.helpers';

interface DirHandleEntry {
  id: number;
  handle: FileSystemDirectoryHandle;
}

@Injectable({
  providedIn: 'root'
})
export class FileLoaderService {
  private readonly indexedDbService = inject(NgxIndexedDBService);

  readonly currentFolderHandle = signal<FileSystemDirectoryHandle | undefined>(undefined);

  constructor() {
    void this.restoreSavedDirectoryHandle();
  }

  private async restoreSavedDirectoryHandle(): Promise<void> {
    try {
      const entry = await firstValueFrom(this.indexedDbService.getByID<DirHandleEntry>('directoryHandles', 1));
      if (entry?.handle) {
        const granted = await verifyPermission(entry.handle);
        if (granted) {
          this.currentFolderHandle.set(entry.handle);
        }
      }
    } catch (error) {
      console.error('Failed to restore directory handle:', error);
    }
  }

  async pickFolder(): Promise<void> {
    try {
      const handle = await showDirectoryPicker();
      this.currentFolderHandle.set(handle);
      await firstValueFrom(
        this.indexedDbService.update('directoryHandles', {
          id: 1,
          handle: handle
        } as DirHandleEntry)
      );
    } catch (error) {
      // User cancelled the picker or access was denied
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Directory picker was cancelled');
      } else {
        console.error('Failed to select directory:', error);
        throw error;
      }
    }
  }

  async openFiles(): Promise<FileData[]> {
    const handle = this.currentFolderHandle();
    if (!handle) {
      return [];
    }

    try {
      return await getAudioFilesFromDirHandle(handle);
    } catch (error) {
      console.error('Failed to load audio files:', error);
      throw error;
    }
  }
}

async function getAudioFilesFromDirHandle(dirHandle: FileSystemDirectoryHandle): Promise<FileData[]> {
  const fileData: FileData[] = [];

  try {
    for await (const [name, entry] of dirHandle.entries()) {
      try {
        if (entry.kind === 'file') {
          const file = await entry.getFile();

          if (ALLOWED_MIMETYPES.includes(file.type)) {
            fileData.push({ file, fileHandle: entry });
          }
        } else if (entry.kind === 'directory') {
          const subFiles = await getAudioFilesFromDirHandle(entry);
          fileData.push(...subFiles);
        }
      } catch (error) {
        console.warn(`Failed to process entry "${name}":`, error);
      }
    }
  } catch (error) {
    console.error('Failed to read directory:', error);
    throw error;
  }

  return fileData;
}

async function verifyPermission(handle: FileSystemDirectoryHandle) {
  // Request permission. If the user grants permission, return true.
  return (await handle.requestPermission()) === 'granted';
}
