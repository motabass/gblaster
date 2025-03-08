import { Injectable } from '@angular/core';
import { Id3Tags } from './id3-tags.types';

@Injectable({ providedIn: 'root' })
export class Id3TagsService {
  private readonly worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('metadata.worker', import.meta.url), { type: 'module' });
  }

  extractTags(file: File): Promise<Id3Tags | null> {
    return new Promise((resolve, reject) => {
      this.worker.addEventListener('message', ({ data }) => resolve(data.tags));
      this.worker.addEventListener('error', ({ error }) => reject(error));
      this.worker.postMessage({ file });
    });
  }

  // If you need to clean up resources when service is destroyed
  dispose(): void {
    this.worker.terminate();
  }
}
