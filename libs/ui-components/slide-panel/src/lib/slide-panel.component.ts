import { Component, HostBinding, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'mtb-slide-panel',
  templateUrl: './slide-panel.component.html',
  styleUrls: ['./slide-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule]
})
export class SlidePanelComponent implements OnChanges {
  @Input() openedState = true;

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
