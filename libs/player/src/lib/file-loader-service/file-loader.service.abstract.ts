export abstract class FileLoaderService {
  abstract async openFolder(): Promise<File[]>;
  abstract getFiles(): File[] | Promise<File[]>;
}
