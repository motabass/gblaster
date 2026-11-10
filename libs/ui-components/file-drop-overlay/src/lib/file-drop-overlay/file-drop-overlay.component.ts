import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, output, Renderer2 } from '@angular/core';

/**
Displays a drop target and emits accepted files or file handles.
*/
@Component({
  selector: 'mtb-file-drop-overlay',
  templateUrl: './file-drop-overlay.component.html',
  styleUrl: './file-drop-overlay.component.scss'
})
export class FileDropOverlayComponent implements AfterViewInit, OnDestroy {
  #hostElement = inject(ElementRef);
  #renderer = inject(Renderer2);

  readonly allowedTypes = input<string[]>(['*/*']);

  readonly filesDroped = output<File[]>();
  readonly fileHandlesDropped = output<FileSystemFileHandle[]>();

  #dragEnterListener: any;
  #dragOverListener: any;
  #dragLeaveListener: any;
  #dragEndListener: any;
  #dropListener: any;

  /**
  Installs global drag-and-drop event listeners.
  */
  ngAfterViewInit() {
    this.#dragEnterListener = this.#renderer.listen('window', 'dragenter', this.over.bind(this));
    this.#dragOverListener = this.#renderer.listen('window', 'dragover', this.over.bind(this));
    this.#dragLeaveListener = this.#renderer.listen('window', 'dragleave', this.leave.bind(this));
    this.#dragEndListener = this.#renderer.listen('window', 'dragend', this.leave.bind(this));
    this.#dropListener = this.#renderer.listen('window', 'drop', this.drop.bind(this));
  }

  /**
  Removes the global drag-and-drop event listeners.
  */
  ngOnDestroy() {
    this.#dragEnterListener();
    this.#dragOverListener();
    this.#dragLeaveListener();
    this.#dragEndListener();
    this.#dropListener();
  }

  /**
  Prevents the default drag behavior and reveals the drop overlay.
  @param event Window drag event.
  */
  protected over(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.#renderer.setStyle(this.#hostElement.nativeElement, 'visibility', 'visible');
  }

  /**
  Prevents the default leave behavior and hides the drop overlay.
  @param event Window drag event.
  */
  protected leave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.#renderer.setStyle(this.#hostElement.nativeElement, 'visibility', 'hidden');
  }

  /**
  Handles dropped items, preferring file handles and falling back to files.
  @param event Window drop event.
  */
  protected drop(event: DragEvent) {
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
              this.#handleFileFallback(event);
            }
          })
          .catch(() => {
            // Fall back to regular files on error
            this.#handleFileFallback(event);
          });

        return; // Exit early - we're handling with file handles
      } catch (error) {
        // Fall through to file fallback
        console.warn('File System Access API failed:', error);
      }
    }

    // Fallback to regular files
    this.#handleFileFallback(event);
  }

  /**
  Emits regular dropped files when file handles are unavailable.
  @param event Drop event containing the file list.
  */
  #handleFileFallback(event: DragEvent) {
    if (event.dataTransfer?.files) {
      this.#handleDroppedFiles(event.dataTransfer.files);
    }
  }

  /**
  Filters dropped files against the configured MIME types and emits them.
  @param droppedFiles File list received from the drop event.
  */
  #handleDroppedFiles(droppedFiles: FileList) {
    const files: File[] = [];
    for (const file of Array.from(droppedFiles)) {
      if (file && this.allowedTypes().includes(file.type)) {
        files.push(file);
      }
    }
    this.filesDroped.emit(files);
  }
}
