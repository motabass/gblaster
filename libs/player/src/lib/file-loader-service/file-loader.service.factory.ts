import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LegacyFileLoaderService } from './legacy-file-loader.service';
import { NativeBrowserFileLoaderService } from './native-browser-file-loader.service';

export function FileLoaderServiceFactory(indexedDbService: NgxIndexedDBService) {
  if ('showOpenFilePicker' in window) {
    return new NativeBrowserFileLoaderService(indexedDbService);
  } else {
    return new LegacyFileLoaderService();
  }
}
