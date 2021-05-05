import { NgxIndexedDBService } from 'ngx-indexed-db';
import { LegacyFileLoaderService } from './legacy-file-loader.service';
import { NativeBrowserFileLoaderService } from './native-browser-file-loader.service';

export function FileLoaderServiceFactory(indexedDbService: NgxIndexedDBService) {
  if ('showOpenFilePicker' in window) {
    console.log('Using native-file-system-api file-loader');
    return new NativeBrowserFileLoaderService(indexedDbService);
  } else {
    console.log('Using legacy file-loader');
    return new LegacyFileLoaderService();
  }
}
