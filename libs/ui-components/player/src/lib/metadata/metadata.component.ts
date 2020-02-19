import { Component, Input, OnInit } from '@angular/core';
import { Song } from '../player.types';

@Component({
  selector: 'mtb-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.css']
})
export class MetadataComponent implements OnInit {
  @Input()
  song: Song;
  constructor() {}

  ngOnInit(): void {}
}
