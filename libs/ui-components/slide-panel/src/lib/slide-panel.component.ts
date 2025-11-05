import { booleanAttribute, Component, Input, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';

@Component({
  selector: 'mtb-slide-panel',
  templateUrl: './slide-panel.component.html',
  styleUrl: './slide-panel.component.scss',
  imports: [MatIcon, MatIconButton, MatTooltip, NgClass],
  host: {
    '[style.bottom]': 'bottom()',
    '[style.top]': 'top()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[class]': 'side()',
    '[class.closed-slide-panel]': '!openedState',
    '[class.opened-slide-panel]': 'openedState'
  }
})
export class SlidePanelComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input({ transform: booleanAttribute }) openedState = true;

  readonly bottom = input<string>();

  readonly top = input<string>();

  readonly width = input('20rem');

  readonly height = input('20rem');

  readonly side = input<'left' | 'right'>('left');

  // TODO: Skipped for migration because:
  //  This input is used in a control flow expression (e.g. `@if` or `*ngIf`)
  //  and migrating would break narrowing currently.
  @Input() toggleIcon?: string;

  readonly buttonTooltip = input<string | undefined>('');

  openPanel() {
    this.openedState = true;
  }

  closePanel() {
    this.openedState = false;
  }
}
