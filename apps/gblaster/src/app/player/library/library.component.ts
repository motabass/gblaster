import { Component, OnInit, inject } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { TrackMetadata } from '../player.types';
import { NgArrayPipesModule } from 'ngx-pipes';
import { MatListModule } from '@angular/material/list';

@Component({
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
  imports: [MatListModule, NgArrayPipesModule]
})
export default class LibraryComponent implements OnInit {
  private indexedDbService = inject(NgxIndexedDBService);

  artists: string[] = [];
  albums: string[] = [];
  tracks: string[] = [];

  private selectedArtist!: string;
  private selectedAlbum!: string;
  private selectedTrack!: string;

  private data?: TrackMetadata[];

  async ngOnInit() {
    this.data = await this.indexedDbService.getAll<TrackMetadata>('metatags').toPromise();
    this.split();
  }

  split() {
    // @ts-expect-error
    this.artists = this.data.map((tag) => tag.artist).filter((artist) => !!artist);
    // @ts-expect-error
    this.albums = this.data.map((tag) => tag.album).filter((album) => !!album);
    // @ts-expect-error
    this.tracks = this.data.map((tag) => tag.title).filter((title) => !!title);
  }

  selectArtist(artist: string | undefined) {
    if (artist) {
      this.selectedArtist = artist;
    }
  }

  selectAlbum(album: string | undefined) {
    if (album) {
      this.selectedAlbum = album;
    }
  }

  selectTrack(track: string | undefined) {
    if (track) {
      this.selectedTrack = track;
    }
  }
}
