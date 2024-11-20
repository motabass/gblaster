import { booleanAttribute, Component, HostBinding, Input, OnChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';

@Component({
  selector: 'mtb-slide-panel',
  templateUrl: './slide-panel.component.html',
  styleUrl: './slide-panel.component.scss',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, NgClass]
})
export class SlidePanelComponent implements OnChanges {
  @Input({ transform: booleanAttribute }) openedState = true;

  @Input() @HostBinding('style.bottom') bottom?: string;

  @Input() @HostBinding('style.top') top?: string;

  @Input() @HostBinding('style.width') width = '20rem';

  @Input() @HostBinding('style.height') height = '20rem';

  @Input() @HostBinding('class') side: 'left' | 'right' = 'left';

  @Input() toggleIcon?: string;

  @Input() buttonTooltip? = '';

  constructor() {}

  @HostBinding('class.closed-slide-panel') closed = false;
  @HostBinding('class.opened-slide-panel') open = true;

  ngOnChanges(): void {
    if (this.openedState) {
      this.open = true;
      this.closed = false;
    } else {
      this.open = false;
      this.closed = true;
    }
  }

  openPanel() {
    this.openedState = true;
    this.open = true;
    this.closed = false;
  }

  closePanel() {
    this.openedState = false;
    this.open = false;
    this.closed = true;
  }
}
