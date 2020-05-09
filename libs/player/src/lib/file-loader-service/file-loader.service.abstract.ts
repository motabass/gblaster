export abstract class FileLoaderService {
  abstract async openFiles(): Promise<File[]>;
}
