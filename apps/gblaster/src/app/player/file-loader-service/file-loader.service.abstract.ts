import { FileData } from './file-loader.helpers';
import { WritableSignal } from '@angular/core';

export abstract class FileLoaderService {
  abstract currentFolderHandle: WritableSignal<FileSystemDirectoryHandle | undefined>;
  abstract openFiles(): Promise<FileData[]>;
  abstract showPicker(): Promise<void>;
}
