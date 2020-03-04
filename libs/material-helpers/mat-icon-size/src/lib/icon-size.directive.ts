import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Directive({
  selector: '[matIconSize]'
})
export class IconSizeDirective implements OnInit {
  @Input('matIconSize')
  size!: string;

  constructor(private elr: ElementRef<MatIcon>, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(this.elr.nativeElement, 'height', this.size);
    this.renderer.setStyle(this.elr.nativeElement, 'width', this.size);
    this.renderer.setStyle(this.elr.nativeElement, 'line-height', this.size);
    this.renderer.setStyle(this.elr.nativeElement, 'font-size', this.size);
  }
}
