import { AfterViewInit, Component, ElementRef, inject, input, OnDestroy, output, Renderer2 } from '@angular/core';

type FileSystemDataTransferItem = DataTransferItem & {
  getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
};

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
  #listenerDisposers: (() => void)[] = [];
  #dragDepth = 0;

  readonly allowedTypes = input<string[]>(['*/*']);

  readonly filesDropped = output<File[]>();
  readonly fileHandlesDropped = output<FileSystemFileHandle[]>();

  /**
  Installs global drag-and-drop event listeners.
  */
  ngAfterViewInit(): void {
    this.#listenerDisposers = [
      this.#renderer.listen('window', 'dragenter', this.over.bind(this)),
      this.#renderer.listen('window', 'dragover', this.over.bind(this)),
      this.#renderer.listen('window', 'dragleave', this.leave.bind(this)),
      this.#renderer.listen('window', 'dragend', this.leave.bind(this)),
      this.#renderer.listen('window', 'drop', this.drop.bind(this))
    ];
  }

  /**
  Removes the global drag-and-drop event listeners.
  */
  ngOnDestroy(): void {
    for (const disposeListener of this.#listenerDisposers) {
      disposeListener();
    }
  }

  /**
  Prevents the default drag behavior and reveals the drop overlay.
  @param event Window drag event.
  */
  protected over(event: DragEvent) {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !this.#isFileDrag(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    dataTransfer.dropEffect = 'copy';
    if (event.type === 'dragenter') {
      this.#dragDepth++;
    }
    this.#renderer.setStyle(this.#hostElement.nativeElement, 'visibility', 'visible');
  }

  /**
  Prevents the default leave behavior and hides the drop overlay.
  @param event Window drag event.
  */
  protected leave(event: DragEvent) {
    if (!this.#isFileDrag(event)) {
      if (event.type === 'dragend') {
        this.#hideOverlay();
      }
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.#dragDepth = event.type === 'dragend' ? 0 : Math.max(0, this.#dragDepth - 1);
    if (this.#dragDepth === 0) {
      this.#hideOverlay();
    }
  }

  /**
  Handles dropped items, preferring file handles and falling back to files.
  @param event Window drop event.
  */
  protected drop(event: DragEvent) {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !this.#isFileDrag(event)) {
      this.#hideOverlay();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.#hideOverlay();

    const droppedFiles = [...dataTransfer.files];
    const items = [...dataTransfer.items];
    if (items.some((item) => typeof (item as FileSystemDataTransferItem).getAsFileSystemHandle === 'function')) {
      void this.#handleFileHandles(items, droppedFiles);
      return;
    }

    this.#handleDroppedFiles(droppedFiles);
  }

  /**
  Returns whether the drag payload contains files.
  @param event Window drag event.
  */
  #isFileDrag(event: DragEvent): boolean {
    const dataTransfer = event.dataTransfer;
    return (
      !!dataTransfer &&
      ([...dataTransfer.types].includes('Files') ||
        [...dataTransfer.items].some((item) => item.kind === 'file') ||
        dataTransfer.files.length > 0)
    );
  }

  #hideOverlay(): void {
    this.#dragDepth = 0;
    this.#renderer.setStyle(this.#hostElement.nativeElement, 'visibility', 'hidden');
  }

  /**
  Prefers file handles when available and falls back to regular files if access fails.
  @param items Items received from the drop event.
  @param droppedFiles Files captured while the drop event is active.
  */
  async #handleFileHandles(items: DataTransferItem[], droppedFiles: File[]): Promise<void> {
    try {
      const handles = await Promise.all(
        items.map(async (item) => {
          const getHandle = (item as FileSystemDataTransferItem).getAsFileSystemHandle;
          return typeof getHandle === 'function' ? getHandle.call(item) : null;
        })
      );
      const fileHandles = handles.filter((handle): handle is FileSystemFileHandle => handle?.kind === 'file');
      const acceptedHandles = await Promise.all(
        fileHandles.map(async (handle) => (this.#isAllowedFile(await handle.getFile()) ? handle : null))
      );
      const filteredHandles = acceptedHandles.filter((handle): handle is FileSystemFileHandle => handle !== null);

      if (filteredHandles.length > 0) {
        this.fileHandlesDropped.emit(filteredHandles);
      } else {
        this.#handleDroppedFiles(droppedFiles);
      }
    } catch {
      this.#handleDroppedFiles(droppedFiles);
    }
  }

  /**
  Filters dropped files against the configured MIME types and emits them.
  @param droppedFiles Files captured from the drop event.
  */
  #handleDroppedFiles(droppedFiles: File[]): void {
    this.filesDropped.emit(droppedFiles.filter((file) => this.#isAllowedFile(file)));
  }

  #isAllowedFile(file: File): boolean {
    const [fileType, fileSubtype] = file.type.trim().toLowerCase().split('/', 2);
    return this.allowedTypes().some((allowedType) => {
      const normalizedAllowedType = allowedType.trim().toLowerCase();
      const [allowedFileType, allowedSubtype] = normalizedAllowedType.split('/', 2);
      return (
        normalizedAllowedType === '*/*' ||
        (allowedFileType === fileType && (allowedSubtype === '*' || allowedSubtype === fileSubtype))
      );
    });
  }
}
