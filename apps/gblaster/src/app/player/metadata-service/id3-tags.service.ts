import { Injectable, OnDestroy } from '@angular/core';
import { Id3Tags } from './id3-tags.types';
import { TagsWorkerRequest, TagsWorkerResponse } from './metadata.types';

@Injectable({ providedIn: 'root' })
export class Id3TagsService implements OnDestroy {
  private readonly worker: Worker;
  private nextId = 0;
  private readonly pendingRequests = new Map<
    string,
    { resolve: (tags?: Id3Tags) => void; reject: (error: Error) => void }
  >();

  constructor() {
    this.worker = new Worker(new URL('metadata.worker', import.meta.url), {
      type: 'module'
    });
    this.worker.addEventListener('message', this.handleMessage);
    this.worker.addEventListener('error', this.handleError);
  }

  extractTags(file: File, timeoutMs = 30_000): Promise<Id3Tags | undefined> {
    if (!this.worker) {
      return Promise.reject(new Error('Metadata worker is not available'));
    }

    const id = `id-${this.nextId++}`;

    return new Promise<Id3Tags | undefined>((resolve, reject) => {
      // Set timeout to avoid hanging promises
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Metadata extraction timed out'));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        resolve: (tags) => {
          clearTimeout(timeoutId);
          resolve(tags);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      this.worker.postMessage({ id, file } as TagsWorkerRequest);
    });
  }

  private handleMessage = (event: MessageEvent<TagsWorkerResponse>): void => {
    const { id, tags, error } = event.data;
    const request = this.pendingRequests.get(id);

    if (request) {
      this.pendingRequests.delete(id);

      if (error) {
        request.reject(new Error(error));
      } else {
        request.resolve(tags);
      }
    }
  };

  private handleError = (event: ErrorEvent): void => {
    console.error('Worker error:', event);
    // Reject all pending requests on catastrophic worker error
    for (const [id, request] of this.pendingRequests.entries()) {
      request.reject(new Error(event.message || 'Unknown worker error'));
      this.pendingRequests.delete(id);
    }
  };

  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessage);
      this.worker.removeEventListener('error', this.handleError);
      this.worker.terminate();
    }

    // Reject any pending requests
    for (const request of this.pendingRequests.values()) {
      request.reject(new Error('Service was destroyed'));
    }
    this.pendingRequests.clear();
  }
}
