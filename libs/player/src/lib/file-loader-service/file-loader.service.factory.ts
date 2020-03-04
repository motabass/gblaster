import { ElectronService } from 'ngx-electron';
import { LegacyFileLoaderService } from './legacy-file-loader.service';
import { NativeBrowserFileLoaderService } from './native-browser-file-loader.service';

export function FileLoaderServiceFactory(electronService: ElectronService) {
  if (electronService.isElectronApp) {
    // return new NodeFileLoaderService(electronService);
    // return new NativeBrowserFileLoaderService();
    return new LegacyFileLoaderService();
  } else {
    if ('chooseFileSystemEntries' in window) {
      return new NativeBrowserFileLoaderService();
    } else {
      return new LegacyFileLoaderService();
    }
  }
}
