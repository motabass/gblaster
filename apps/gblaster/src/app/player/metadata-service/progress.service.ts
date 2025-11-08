import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly totalFilesToProcess = signal(0);
  private readonly filesToProcess = signal(0);
  private readonly processingFile = signal('');

  readonly processionPercent = computed(() => {
    return 100 - (this.filesToProcess() / this.totalFilesToProcess()) * 100;
  });

  readonly processing = computed(() => {
    return this.filesToProcess() > 0;
  });

  readonly currentFile = this.processingFile.asReadonly();

  readonly statusText = computed(() => {
    const totalFilesToProcess = this.totalFilesToProcess();
    let text = `Processing (${totalFilesToProcess - this.filesToProcess()} / ${totalFilesToProcess}): `;
    text += this.processing() ? this.processingFile() : 'Finished';
    return text;
  });

  startProcessing(totalFiles: number): void {
    this.totalFilesToProcess.set(totalFiles);
    this.filesToProcess.set(totalFiles);
  }

  updateCurrentFile(fileName: string): void {
    this.processingFile.set(fileName);
  }

  completeFile(): void {
    this.filesToProcess.update((files) => files - 1);
  }

  reset(): void {
    this.totalFilesToProcess.set(0);
    this.filesToProcess.set(0);
    this.processingFile.set('');
  }
}
