import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'mtb-file-drop-overlay',
  templateUrl: './file-drop-overlay.component.html',
  styleUrls: ['./file-drop-overlay.component.scss']
})
export class FileDropOverlayComponent {
  @Input() allowedTypes: string[] = ['*/*'];

  @Output() readonly filesDroped: EventEmitter<File[]> = new EventEmitter<File[]>();

  constructor(private hostElement: ElementRef, private renderer: Renderer2) {
    window.addEventListener('dragenter', this.over.bind(this));
    window.addEventListener('dragstart', this.over.bind(this));
    window.addEventListener('dragover', this.over.bind(this));

    window.addEventListener('dragleave', this.leave.bind(this));
    window.addEventListener('dragend', this.leave.bind(this));

    window.addEventListener('drop', (event: DragEvent) => {
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
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files?.item(i);
        if (file && this.allowedTypes.includes(file.type)) {
          files.push(file);
        }
      }
    }
    this.filesDroped.emit(files);
  }
}
