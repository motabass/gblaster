import { Component } from '@angular/core';
import { UpdateService } from './update.service';

@Component({
  selector: 'mtb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(updateService: UpdateService) {
    updateService.init();
  }
}
