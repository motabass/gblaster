import { afterNextRender, booleanAttribute, Component, input, linkedSignal, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'mtb-slide-panel',
  imports: [MatIcon, MatIconButton, MatTooltip],
  templateUrl: './slide-panel.component.html',
  styleUrl: './slide-panel.component.scss',
  host: {
    '[style.bottom]': 'bottom()',
    '[style.top]': 'top()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[class]': 'side()',
    '[class.closed-slide-panel]': '!openedState()',
    '[class.opened-slide-panel]': 'openedState()',
    '[class.initialized]': 'isInitialized()'
  }
})
export class SlidePanelComponent {
  readonly isInitialized = signal(false);

  constructor() {
    afterNextRender(() => {
      // Enable transitions after the first render
      this.isInitialized.set(true);
    });
  }
  readonly opened = input(false, { transform: booleanAttribute });

  readonly openedState = linkedSignal(() => this.opened());

  readonly bottom = input<string>();

  readonly top = input<string>();

  readonly width = input('20rem');

  readonly height = input('20rem');

  readonly side = input<'left' | 'right'>('left');

  readonly toggleIcon = input<string>('');

  readonly buttonTooltip = input<string | undefined>('');

  openPanel() {
    this.openedState.set(true);
  }

  closePanel() {
    this.openedState.set(false);
  }
}
