import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VisualsService } from './visuals.service';

// TODO: make configurable
// TODO: https://developers.google.com/web/updates/2017/03/background_tabs for better bsckground performsnce

@Component({
  selector: 'mtb-visuals',
  templateUrl: './visuals.component.html'
})
export class VisualsComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  constructor(private visualsService: VisualsService) {}

  ngOnInit(): void {
    this.visualsService.setCanvasContext(this.canvas.nativeElement.getContext('2d'));
  }
}
