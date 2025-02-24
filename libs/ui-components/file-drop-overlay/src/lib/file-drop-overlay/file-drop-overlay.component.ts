import { Component, ElementRef, Renderer2, inject, output, input } from '@angular/core';

@Component({
  selector: 'mtb-file-drop-overlay',
  templateUrl: './file-drop-overlay.component.html',
  styleUrl: './file-drop-overlay.component.scss',
  imports: []
})
export class FileDropOverlayComponent {
  private hostElement = inject(ElementRef);
  private renderer = inject(Renderer2);

  readonly allowedTypes = input<string[]>(['*/*']);

  readonly filesDroped = output<File[]>();

  constructor() {
    globalThis.addEventListener('dragenter', this.over.bind(this));
    globalThis.addEventListener('dragstart', this.over.bind(this));
    globalThis.addEventListener('dragover', this.over.bind(this));

    globalThis.addEventListener('dragleave', this.leave.bind(this));
    globalThis.addEventListener('dragend', this.leave.bind(this));

    globalThis.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.leave(event);
      this.drop(event);
    });
  }

  over(event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      // Test that the item being dragged is a valid one
      event.dataTransfer.dropEffect = 'copy';
      event.preventDefault();
    }
    this.renderer.setStyle(this.hostElement.nativeElement, 'display', 'flex');
  }

  leave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.renderer.setStyle(this.hostElement.nativeElement, 'display', 'none');
  }

  drop(event: any) {
    const files: File[] = [];
    if (event.dataTransfer.files) {
      for (let index = 0; index < event.dataTransfer.files.length; index++) {
        const file = event.dataTransfer.files?.item(index);
        if (file && this.allowedTypes().includes(file.type)) {
          files.push(file);
        }
      }
    }
    this.filesDroped.emit(files);
  }
}
