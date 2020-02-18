import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SlidePanelComponent } from './slide-panel.component';

export default {
  title: 'SlidePanelComponent'
};

export const open = () => ({
  moduleMetadata: {
    imports: [MatIconModule, MatButtonModule]
  },
  component: SlidePanelComponent,
  props: {
    opened: true
  }
});

export const closed = () => ({
  moduleMetadata: {
    imports: [MatIconModule, MatButtonModule]
  },
  component: SlidePanelComponent,
  props: {
    opened: false
  }
});
