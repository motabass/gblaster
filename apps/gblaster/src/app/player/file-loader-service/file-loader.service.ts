import { Injectable } from '@angular/core';
import { ALLOWED_MIMETYPES, FileData } from './file-loader.helpers';

@Injectable({
  providedIn: 'root'
})
export class FileLoaderService {
  private async pickFolder() {
    try {
      const handle = await showDirectoryPicker();
      return handle;
    } catch (error) {
      // User cancelled the picker or access was denied
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Directory picker was cancelled');
        return undefined;
      } else {
        console.error('Failed to select directory:', error);
        throw error;
      }
    }
  }

  async getFilesFromPickedFolder(): Promise<FileData[]> {
    const handle = await this.pickFolder();
    if (!handle) {
      return [];
    }

    try {
      return await recursiveGetAudioFilesFromDirectory(handle);
    } catch (error) {
      console.error('Failed to load audio files:', error);
      throw error;
    }
  }
}

async function recursiveGetAudioFilesFromDirectory(dirHandle: FileSystemDirectoryHandle): Promise<FileData[]> {
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
          const subFiles = await recursiveGetAudioFilesFromDirectory(entry);
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
