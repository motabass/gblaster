import { inject, Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { ALLOWED_MIMETYPES, FileData } from './file-loader.helpers';

@Injectable({
  providedIn: 'root'
})
export class FileLoaderService {
  private readonly platform = inject(Platform);

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

  private async pickFiles(): Promise<FileSystemFileHandle[]> {
    try {
      const handles = await showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: 'Audio Files',
            accept: {
              'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aiff', '.opus']
            }
          }
        ]
      });
      return handles;
    } catch (error) {
      // User cancelled the picker or access was denied
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('File picker was cancelled');
        return [];
      } else {
        console.error('Failed to select files:', error);
        throw error;
      }
    }
  }

  async getFilesFromPickedFolder(): Promise<FileData[]> {
    if (this.platform.ANDROID) {
      const fileHandles = await this.pickFiles();
      if (fileHandles.length === 0) {
        return [];
      }

      try {
        const fileData: FileData[] = [];
        for (const fileHandle of fileHandles) {
          const file = await fileHandle.getFile();
          // if (ALLOWED_MIMETYPES.includes(file.type)) {
          fileData.push({ file, fileHandle });
          // }
        }
        return fileData;
      } catch (error) {
        console.error('Failed to load audio files:', error);
        throw error;
      }
    } else {
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
