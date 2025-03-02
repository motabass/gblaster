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
    if (event.dataTransfer?.files) {
      this.handleDroppedFiles(event.dataTransfer?.files);
    }
  }

  private handleDroppedFiles(droppedFiles: FileList) {
    const files: File[] = [];
    for (let index = 0; index < droppedFiles.length; index++) {
      const file = droppedFiles.item(index);
      if (file && this.allowedTypes().includes(file.type)) {
        files.push(file);
      }
    }
    this.filesDroped.emit(files);
  }
}
