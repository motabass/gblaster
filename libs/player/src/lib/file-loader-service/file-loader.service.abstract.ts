export abstract class FileLoaderService {
  abstract async openFolder(): Promise<boolean>;
  abstract async getFiles(): Promise<File[]>;
}
