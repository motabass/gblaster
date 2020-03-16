export abstract class FileLoaderService {
  abstract async openFiles(): Promise<File[]>;
  abstract getFiles(): File[] | Promise<File[]>;
}
