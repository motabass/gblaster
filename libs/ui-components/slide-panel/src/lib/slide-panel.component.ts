import { booleanAttribute, Component, HostBinding, Input, input, OnChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';

@Component({
  selector: 'mtb-slide-panel',
  templateUrl: './slide-panel.component.html',
  styleUrl: './slide-panel.component.scss',
  imports: [MatIcon, MatIconButton, MatTooltip, NgClass]
})
export class SlidePanelComponent implements OnChanges {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input({ transform: booleanAttribute }) openedState = true;

  // TODO: Skipped for migration because:
  //  This input is used in combination with `@HostBinding` and migrating would
  //  break.
  @Input() @HostBinding('style.bottom') bottom?: string;

  // TODO: Skipped for migration because:
  //  This input is used in combination with `@HostBinding` and migrating would
  //  break.
  @Input() @HostBinding('style.top') top?: string;

  // TODO: Skipped for migration because:
  //  This input is used in combination with `@HostBinding` and migrating would
  //  break.
  @Input() @HostBinding('style.width') width = '20rem';

  // TODO: Skipped for migration because:
  //  This input is used in combination with `@HostBinding` and migrating would
  //  break.
  @Input() @HostBinding('style.height') height = '20rem';

  // TODO: Skipped for migration because:
  //  This input is used in combination with `@HostBinding` and migrating would
  //  break.
  @Input() @HostBinding('class') side: 'left' | 'right' = 'left';

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() toggleIcon?: string;

  readonly buttonTooltip = input<string | undefined>('');

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
