import { Injectable } from '@angular/core';
import { FileLoaderService } from '@motabass/player/src/lib/file-loader-service/file-loader.service.abstract';
import { ElectronService } from 'ngx-electron';
import * as path from 'path';

@Injectable({
  providedIn: 'any'
})
export class NodeFileLoaderService extends FileLoaderService {
  private fileNames: string[] = [];
  private folderPath = '';

  constructor(private electronService: ElectronService) {
    super();
  }

  async openFolder(): Promise<boolean> {
    const dialog = this.electronService.remote.dialog;
    const fs = this.electronService.remote.require('fs');

    const response = await dialog.showOpenDialog({
      title: 'Select a folder',
      properties: ['openDirectory'],
      filters: [{ name: 'Audio Files (mp3)', extensions: ['mp3'] }]
    });

    // folderPaths is an array that contains all the selected paths
    if (response.canceled) {
      console.log('No destination folder selected');
      return false;
    } else {
      const folderPath = response.filePaths[0];

      this.folderPath = folderPath;

      let items: string[] = [];
      try {
        items = await fs.promises.readdir(folderPath);
      } catch (e) {
        console.warn(e);
      }

      this.fileNames = items;

      console.log(this.fileNames);
    }

    return true;
  }

  async getFiles(): Promise<File[]> {
    const files: any[] = [];
    for (const filename of this.fileNames) {
      console.log('making File');
      const fs = this.electronService.remote.require('fs');
      const buffer = fs.readFileSync(path.join(this.folderPath, filename));
      const fileBlob = new File([new Blob(buffer)], filename, { type: 'audio/mp3' });
      files.push(fileBlob);
      console.log('making File done');
    }
    return files;
  }
}
