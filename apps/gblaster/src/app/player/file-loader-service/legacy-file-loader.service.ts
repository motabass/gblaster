import { Injectable, signal } from '@angular/core';
import { ALLOWED_MIMETYPES, FileData } from './file-loader.helpers';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'root'
})
export class LegacyFileLoaderService implements FileLoaderService {
  private readonly fileInput!: HTMLInputElement;

  private files: File[] = [];

  constructor() {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.id = 'hidden_file_input';
    this.fileInput.style.display = 'none';
    this.fileInput.accept = ALLOWED_MIMETYPES.join('|');
    this.fileInput.multiple = true;

    document.body.append(this.fileInput);
  }

  readonly currentFolderHandle = signal(undefined);

  async openFiles(): Promise<FileData[]> {
    return this.files.map((file) => ({ file }));
  }

  private getFiles(): File[] {
    const files: File[] = [];
    if (this.fileInput.files) {
      for (let index = 0; index < this.fileInput.files.length; index++) {
        const file = this.fileInput.files?.item(index);
        if (file && ALLOWED_MIMETYPES.includes(file.type)) {
          files.push(file);
        }
      }
    }
    return files;
  }

  async showPicker(): Promise<void> {
    this.fileInput.click();
    const files: File[] = await new Promise((resolve) => {
      this.fileInput.addEventListener('change', () => resolve(this.getFiles())); // resolve with input, not event
    });

    this.files = files;
  }
}
