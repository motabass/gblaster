import { Injectable } from '@angular/core';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'root' })
export class Id3TagsService {
  worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('metadata.worker', import.meta.url), { type: 'module' });
  }

  async extractTags(file: File): Promise<Id3Tags | null> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = ({ data }) => {
        // worker.terminate();
        resolve(data.tags);
      };
      this.worker.onerror = (error) => {
        // worker.terminate();
        reject(error);
      };

      this.worker.postMessage({ file: file });
    });
  }
}
