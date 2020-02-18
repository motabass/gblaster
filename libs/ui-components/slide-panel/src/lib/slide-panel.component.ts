import { Component, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Component({
  selector: 'mtb-slide-panel',
  templateUrl: './slide-panel.component.html',
  styleUrls: ['./slide-panel.component.scss']
})
export class SlidePanelComponent implements OnChanges {
  @Input()
  opened = true;

  constructor(private host: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    if (this.opened === true) {
      this.renderer.removeClass(this.host.nativeElement, 'closed-slide-panel');
      this.renderer.addClass(this.host.nativeElement, 'opened-slide-panel');
    } else {
      this.renderer.removeClass(this.host.nativeElement, 'opened-slide-panel');
      this.renderer.addClass(this.host.nativeElement, 'closed-slide-panel');
    }
  }

  open() {
    this.opened = true;
    this.renderer.removeClass(this.host.nativeElement, 'closed-slide-panel');
    this.renderer.addClass(this.host.nativeElement, 'opened-slide-panel');
  }

  close() {
    this.opened = false;
    this.renderer.removeClass(this.host.nativeElement, 'opened-slide-panel');
    this.renderer.addClass(this.host.nativeElement, 'closed-slide-panel');
  }
}
