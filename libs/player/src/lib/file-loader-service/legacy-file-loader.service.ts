import { Injectable } from '@angular/core';
import { FileLoaderService } from './file-loader.service.abstract';

@Injectable({
  providedIn: 'any'
})
export class LegacyFileLoaderService extends FileLoaderService {
  private fileInput!: HTMLInputElement;

  constructor() {
    super();
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.id = 'hidden_file_input';
    this.fileInput.style.display = 'none';
    this.fileInput.accept = 'audio/mp3';
    this.fileInput.multiple = true;

    document.body.appendChild(this.fileInput);
  }

  async openFolder(): Promise<File[]> {
    this.fileInput.click();
    const files: File[] = await new Promise((resolve) => {
      this.fileInput.onchange = () => resolve(this.getFiles()); // resolve with input, not event
    });
    return files;
  }

  getFiles(): File[] {
    const files: File[] = [];
    if (this.fileInput.files) {
      for (let i = 0; i < this.fileInput.files.length; i++) {
        const file = this.fileInput.files?.item(i);
        if (file && file.type === 'audio/mp3') {
          files.push(file);
        }
      }
    }
    return files;
  }
}
