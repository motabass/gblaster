import { Component } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { distinct, filter, reduce, switchMap } from 'rxjs/operators';
import { SongMetadata } from '../player.types';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Component({
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent {
  private _data$: BehaviorSubject<SongMetadata[]> = new BehaviorSubject<SongMetadata[]>([]);
  private _filtered$: Observable<SongMetadata>;

  artists$: Observable<string[]>;
  albums$: Observable<string[]>;
  tracks$: Observable<string[]>;

  private selectedArtist!: string;
  private selectedAlbum!: string;
  private selectedTrack!: string;

  constructor(private indexedDbService: NgxIndexedDBService) {
    // @ts-ignore
    this._filtered$ = this._data$.pipe(
      switchMap((metatags) => from(metatags)),
      filter((song) => !!song),
      // @ts-ignore
      filter((song) => !this.selectedArtist || song.artist === this.selectedArtist),
      // @ts-ignore
      filter((song) => !this.selectedAlbum || song.album === this.selectedAlbum),
      // @ts-ignore
      filter((song) => !this.selectedTrack || song.track === this.selectedTrack)
    );

    this.artists$ = this._filtered$.pipe(
      distinct(({ artist }) => artist),
      filter((metatags: SongMetadata) => !!metatags.artist),
      // @ts-ignore
      reduce((curr: string[], next: SongMetadata) => [...curr, next.artist], [])
    );

    this.albums$ = this._filtered$.pipe(
      distinct(({ album }) => album),
      filter((metatags: SongMetadata) => !!metatags.album),
      // @ts-ignore
      reduce((curr: string[], next: SongMetadata) => [...curr, next.album], [])
    );

    this.tracks$ = this._filtered$.pipe(
      distinct(({ title }) => title),
      filter((metatags: SongMetadata) => !!metatags.title),
      // @ts-ignore
      reduce((curr: string[], next: SongMetadata) => [...curr, next.title], [])
    );

    this.indexedDbService.getAll<SongMetadata>('metatags').subscribe(this._data$);
  }

  selectArtist(artist: string) {
    this.selectedArtist = artist;
  }
}
