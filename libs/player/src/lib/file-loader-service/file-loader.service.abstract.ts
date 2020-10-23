export abstract class FileLoaderService {
  abstract currentFolderHandle?: FileSystemDirectoryHandle;
  abstract async openFiles(): Promise<File[]>;
  abstract async showPicker(): Promise<void>;
  abstract async init(): Promise<void>;
}
