import { computed, Service, signal } from '@angular/core';

/**
Publishes progress state while batches of library files are processed.
*/
@Service()
export class ProgressService {
  readonly #totalFilesToProcess = signal(0);
  readonly #filesToProcess = signal(0);
  readonly #processingFile = signal('');

  readonly processionPercent = computed(() => {
    return 100 - (this.#filesToProcess() / this.#totalFilesToProcess()) * 100;
  });

  readonly processing = computed(() => {
    return this.#filesToProcess() > 0;
  });

  readonly currentFile = this.#processingFile.asReadonly();

  readonly statusText = computed(() => {
    const totalFilesToProcess = this.#totalFilesToProcess();
    let text = `Processing (${totalFilesToProcess - this.#filesToProcess()} / ${totalFilesToProcess}): `;
    text += this.processing() ? this.#processingFile() : 'Finished';
    return text;
  });

  /**
  Initializes progress counters for a batch containing the given number of files.
  @param totalFiles Number of files in the batch.
  */
  startProcessing(totalFiles: number): void {
    this.#totalFilesToProcess.set(totalFiles);
    this.#filesToProcess.set(totalFiles);
  }

  /**
  Sets the name or status of the file currently being processed.
  @param fileName File name or processing status to display.
  */
  updateCurrentFile(fileName: string): void {
    this.#processingFile.set(fileName);
  }

  /**
  Marks one file in the current batch as complete.
  */
  completeFile(): void {
    this.#filesToProcess.update((files) => files - 1);
  }

  /**
  Clears the batch counters and current-file status.
  */
  reset(): void {
    this.#totalFilesToProcess.set(0);
    this.#filesToProcess.set(0);
    this.#processingFile.set('');
  }
}
