import { LegacyFileLoaderService } from './legacy-file-loader.service';
import { NativeBrowserFileLoaderService } from './native-browser-file-loader.service';

export function FileLoaderServiceFactory() {
  if ('showOpenFilePicker' in globalThis) {
    console.log('Using native-file-system-api file-loader');
    return new NativeBrowserFileLoaderService();
  } else {
    console.log('Using legacy file-loader');
    return new LegacyFileLoaderService();
  }
}
