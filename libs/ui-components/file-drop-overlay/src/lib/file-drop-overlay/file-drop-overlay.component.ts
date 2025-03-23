import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, output, Renderer2 } from '@angular/core';

@Component({
  selector: 'mtb-file-drop-overlay',
  templateUrl: './file-drop-overlay.component.html',
  styleUrls: ['./file-drop-overlay.component.scss']
})
export class FileDropOverlayComponent implements AfterViewInit, OnDestroy {
  private hostElement = inject(ElementRef);
  private renderer = inject(Renderer2);

  readonly allowedTypes = input<string[]>(['*/*']);

  readonly filesDroped = output<File[]>();
  readonly fileHandlesDropped = output<FileSystemFileHandle[]>();

  private dragEnterListener: any;
  private dragOverListener: any;
  private dragLeaveListener: any;
  private dragEndListener: any;
  private dropListener: any;

  ngAfterViewInit() {
    this.dragEnterListener = this.renderer.listen('window', 'dragenter', this.over.bind(this));
    this.dragOverListener = this.renderer.listen('window', 'dragover', this.over.bind(this));
    this.dragLeaveListener = this.renderer.listen('window', 'dragleave', this.leave.bind(this));
    this.dragEndListener = this.renderer.listen('window', 'dragend', this.leave.bind(this));
    this.dropListener = this.renderer.listen('window', 'drop', this.drop.bind(this));
  }

  ngOnDestroy() {
    this.dragEnterListener();
    this.dragOverListener();
    this.dragLeaveListener();
    this.dragEndListener();
    this.dropListener();
  }

  over(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.renderer.setStyle(this.hostElement.nativeElement, 'visibility', 'visible');
  }

  leave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.renderer.setStyle(this.hostElement.nativeElement, 'visibility', 'hidden');
  }

  drop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.leave(event);

    // Try to get file handles first
    if (event.dataTransfer?.items && 'getAsFileSystemHandle' in event.dataTransfer.items[0]) {
      try {
        const fileHandles: FileSystemFileHandle[] = [];
        const promises: Promise<void>[] = [];

        for (const item of Array.from(event.dataTransfer.items)) {
          const promise = (item as any).getAsFileSystemHandle().then((handle: any) => {
            if (handle && handle.kind === 'file') {
              fileHandles.push(handle);
            }
          });
          promises.push(promise);
        }

        // When all promises are resolved, emit the file handles
        Promise.all(promises)
          .then(() => {
            if (fileHandles.length > 0) {
              this.fileHandlesDropped.emit(fileHandles);
            } else {
              // Fall back to regular files if no file handles were obtained
              this.handleFileFallback(event);
            }
          })
          .catch(() => {
            // Fall back to regular files on error
            this.handleFileFallback(event);
          });

        return; // Exit early - we're handling with file handles
      } catch (error) {
        // Fall through to file fallback
        console.warn('File System Access API failed:', error);
      }
    }

    // Fallback to regular files
    this.handleFileFallback(event);
  }

  private handleFileFallback(event: DragEvent) {
    if (event.dataTransfer?.files) {
      this.handleDroppedFiles(event.dataTransfer.files);
    }
  }

  private handleDroppedFiles(droppedFiles: FileList) {
    const files: File[] = [];
    for (const file of Array.from(droppedFiles)) {
      if (file && this.allowedTypes().includes(file.type)) {
        files.push(file);
      }
    }
    this.filesDroped.emit(files);
  }
}
