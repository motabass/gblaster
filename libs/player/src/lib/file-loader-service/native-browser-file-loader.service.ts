import { Injectable } from '@angular/core';
import { ALLOWED_EXTENSIONS, ALLOWED_FILETYPES } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'any'
})
export class NativeBrowserFileLoaderService extends FileLoaderService {
  private currentFolderHandle: any;

  constructor() {
    super();
  }

  async openFiles(): Promise<File[]> {
    const opts = {
      type: 'open-directory',
      recursive: true,
      accepts: [
        {
          description: 'Audio-Files',
          extensions: ALLOWED_EXTENSIONS,
          mimeTypes: ALLOWED_FILETYPES
        }
      ]
    };

    // @ts-ignore
    const handle = await window.chooseFileSystemEntries(opts);
    this.currentFolderHandle = handle;
    return await getAudioFilesFromDirHandle(handle);
  }
}

async function getAudioFilesFromDirHandle(dirHandle: any): Promise<File[]> {
  const files: File[] = [];
  for await (const entry of dirHandle.getEntries()) {
    if (entry.isFile) {
      const file = await entry.getFile();
      if (ALLOWED_FILETYPES.includes(file.type)) {
        // TODO: remove double check when accepts works for directories in API
        files.push(file);
      }
    }
  }
  return files;
}

async function getSubDirsFromDirHandle(dirHandle: any): Promise<any[]> {
  const dirs: any[] = [];
  for await (const entry of dirHandle.getEntries()) {
    if (entry.isDirectory) {
      dirs.push(entry);
    }
  }
  return dirs;
}
