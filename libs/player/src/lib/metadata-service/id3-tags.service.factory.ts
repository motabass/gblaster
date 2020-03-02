import { NodeId3TagsService } from '@motabass/player/src/lib/metadata-service/node-id3-tags.service';
import { ElectronService } from 'ngx-electron';
import { BrowserId3TagsService } from './browser-id3-tags.service';

export function Id3TagsServiceFactory(electronService: ElectronService) {
  if (electronService.isElectronApp) {
    return new NodeId3TagsService(electronService);
    // return new BrowserId3TagsService();
  } else {
    return new BrowserId3TagsService();
  }
}
