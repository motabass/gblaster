import { OnDestroy, Service } from '@angular/core';
import { Id3Tags } from './id3-tags.types';
import { TagsWorkerResponse } from './metadata.types';

/**
Extracts ID3 tags in a worker and resolves requests by their generated IDs.
*/
@Service()
export class Id3TagsService implements OnDestroy {
  readonly #worker: Worker;
  #nextId = 0;
  readonly #pendingRequests = new Map<string, { resolve: (tags?: Id3Tags) => void; reject: (error: Error) => void }>();

  /**
  Creates the metadata worker and registers its message and error handlers.
  */
  constructor() {
    this.#worker = new Worker(new URL('metadata.worker', import.meta.url), {
      type: 'module'
    });
    this.#worker.addEventListener('message', this.#handleMessage);
    this.#worker.addEventListener('error', this.#handleError);
  }

  /**
  Extracts tags from a file, rejecting if extraction fails or times out.
  */
  extractTags(file: File, timeoutMs = 30_000): Promise<Id3Tags | undefined> {
    if (!this.#worker) {
      return Promise.reject(new Error('Metadata worker is not available'));
    }

    const id = `id-${this.#nextId++}`;

    return new Promise<Id3Tags | undefined>((resolve, reject) => {
      // Set timeout to avoid hanging promises
      const timeoutId = setTimeout(() => {
        this.#pendingRequests.delete(id);
        reject(new Error('Metadata extraction timed out'));
      }, timeoutMs);

      this.#pendingRequests.set(id, {
        resolve: (tags) => {
          clearTimeout(timeoutId);
          resolve(tags);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      this.#worker.postMessage({ id, file });
    });
  }

  /**
  Resolves or rejects the pending request identified by a worker response.
  */
  #handleMessage = (event: MessageEvent<TagsWorkerResponse>): void => {
    const { id, tags, error } = event.data;
    const request = this.#pendingRequests.get(id);

    if (!request) {
      return;
    }

    this.#pendingRequests.delete(id);

    if (error) {
      request.reject(new Error(error));
    } else {
      request.resolve(tags);
    }
  };

  /**
  Rejects all pending extraction requests after a worker-level error.
  */
  #handleError = (event: ErrorEvent): void => {
    console.error('Worker error:', event);
    // Reject all pending requests on catastrophic worker error
    for (const [id, request] of this.#pendingRequests) {
      request.reject(new Error(event.message || 'Unknown worker error'));
      this.#pendingRequests.delete(id);
    }
  };

  /**
  Removes worker listeners, terminates the worker, and rejects pending work.
  */
  ngOnDestroy(): void {
    if (this.#worker) {
      this.#worker.removeEventListener('message', this.#handleMessage);
      this.#worker.removeEventListener('error', this.#handleError);
      this.#worker.terminate();
    }

    // Reject any pending requests
    for (const request of this.#pendingRequests.values()) {
      request.reject(new Error('Service was destroyed'));
    }
    this.#pendingRequests.clear();
  }
}
