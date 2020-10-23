import { LegacyFileLoaderService } from './legacy-file-loader.service';
import { NativeBrowserFileLoaderService } from './native-browser-file-loader.service';

export function FileLoaderServiceFactory() {
  if ('showOpenFilePicker' in window) {
    return new NativeBrowserFileLoaderService();
  } else {
    return new LegacyFileLoaderService();
  }
}
