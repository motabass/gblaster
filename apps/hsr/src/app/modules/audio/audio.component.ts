import { Component, OnInit } from '@angular/core';
import { HowlerService } from '@motabass/ui-components/player';

@Component({
  selector: 'hsr-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.css']
})
export class AudioComponent implements OnInit {
  constructor(private howlerService: HowlerService) {}

  ngOnInit(): void {}

  get analyser(): AnalyserNode {
    return this.howlerService.getAnalyzer();
  }
}
