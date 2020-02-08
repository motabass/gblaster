import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'mtb-slide-panel',
  templateUrl: './slide-panel.component.html',
  styleUrls: ['./slide-panel.component.scss']
})
export class SlidePanelComponent implements OnInit {
  opened = true;

  constructor(private host: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit(): void {
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
