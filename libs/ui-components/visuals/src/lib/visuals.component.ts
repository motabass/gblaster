import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { VisualsService } from './visuals.service';

// TODO: make configurable
// TODO: https://developers.google.com/web/updates/2017/03/background_tabs for better bsckground performsnce

@Component({
  selector: 'mtb-visuals',
  templateUrl: './visuals.component.html'
})
export class VisualsComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false })
  canvas: ElementRef;

  constructor(private visualsService: VisualsService) {
  }

  ngAfterViewInit(): void {
    this.visualsService.canvas = this.canvas.nativeElement;
  }
}
