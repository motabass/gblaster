export abstract class FileLoaderService {
  abstract currentFolderHandle?: FileSystemDirectoryHandle;
  abstract openFiles(): Promise<File[]>;
  abstract showPicker(): Promise<void>;
  abstract init(): Promise<void>;
}
