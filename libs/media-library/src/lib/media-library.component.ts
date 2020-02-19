import { Component, OnInit } from '@angular/core';
import { HowlerService } from '@motabass/ui-components/player';

@Component({
  selector: 'motabass-media-library',
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.css']
})
export class MediaLibraryComponent implements OnInit {
  constructor(private howlerService: HowlerService) {}

  ngOnInit(): void {}

  get analyser(): AnalyserNode {
    return this.howlerService.getAnalyzer();
  }
}
