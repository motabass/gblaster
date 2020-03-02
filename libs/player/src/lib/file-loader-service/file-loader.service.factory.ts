import { LegacyFileLoaderService } from '@motabass/player/src/lib/file-loader-service/legacy-file-loader.service';
import { ElectronService } from 'ngx-electron';

export function FileLoaderServiceFactory(electronService: ElectronService) {
  if (electronService.isElectronApp) {
    // return new NodeFileLoaderService(electronService);
    // return new NativeBrowserFileLoaderService();
    return new LegacyFileLoaderService();
  } else {
    // return new NativeBrowserFileLoaderService();
    return new LegacyFileLoaderService();
  }
}
