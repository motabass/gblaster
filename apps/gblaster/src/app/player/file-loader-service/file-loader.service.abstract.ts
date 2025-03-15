import { FileData } from './file-loader.helpers';

export abstract class FileLoaderService {
  abstract currentFolderHandle?: FileSystemDirectoryHandle;
  abstract openFiles(): Promise<FileData[]>;
  abstract showPicker(): Promise<void>;
  abstract init(): Promise<void>;
}
