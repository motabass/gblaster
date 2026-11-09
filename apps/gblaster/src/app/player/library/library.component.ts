import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IndexedDbTrackMetadata, Track } from '../player.types';
import {
  MatListItem,
  MatListItemAvatar,
  MatListItemIcon,
  MatListItemMeta,
  MatListItemTitle,
  MatNavList
} from '@angular/material/list';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PlayerService } from '../player.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatFormField, MatHint, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LibraryService } from './library.service';
import { Album } from './library.types';
import { debounce, form, FormField } from '@angular/forms/signals';
import Fuse from 'fuse.js';

const collator = new Intl.Collator();

@Component({
  imports: [
    MatNavList,
    MatListItem,
    MatListItemTitle,
    MatListItemMeta,
    MatListItemAvatar,
    MatListItemIcon,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    MatIconButton,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    MatHint,
    MatFormField,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatProgressSpinner,
    FormField
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export default class LibraryComponent implements OnInit {
  readonly #playerService = inject(PlayerService);
  protected readonly libraryService = inject(LibraryService);

  protected readonly searchTermForm = form(signal({ searchTerm: '' }), (f) => {
    debounce(f.searchTerm, 300);
  });

  protected readonly searchTerm = computed(() => {
    return this.searchTermForm.searchTerm().value();
  });

  readonly #sortedTracks = computed(() =>
    this.libraryService.indexedDbTracks().toSorted((a, b) => {
      const artistCompare = collator.compare(a.artist || '', b.artist || '');
      if (artistCompare !== 0) return artistCompare;

      const albumCompare = collator.compare(a.album || '', b.album || '');
      if (albumCompare !== 0) return albumCompare;

      const aTrack = a.track === undefined ? Number.NaN : Number(a.track);
      const bTrack = b.track === undefined ? Number.NaN : Number(b.track);
      if (!Number.isNaN(aTrack) && !Number.isNaN(bTrack)) {
        return aTrack - bTrack;
      }

      return collator.compare(a.title || '', b.title || '');
    })
  );

  readonly #fuse = computed(
    () =>
      new Fuse(this.#sortedTracks(), {
        keys: [
          { name: 'title', weight: 1 },
          { name: 'artist', weight: 0.8 },
          { name: 'album', weight: 0.3 },
          { name: 'fileName', weight: 0.1 }
        ],
        threshold: 0.2, // 0.0 = exact match, 1.0 = match anything
        useExtendedSearch: true,
        ignoreLocation: true,
        ignoreDiacritics: true,
        isCaseSensitive: false,
        minMatchCharLength: 2
      })
  );

  // Keeps the sorted order of sortedTracks
  readonly #filteredBySearchTerm = computed(() => {
    const searchTerm = this.searchTerm();
    const tracks = this.#sortedTracks();

    if (!searchTerm) {
      return tracks;
    }

    const matches = new Set(
      this.#fuse()
        .search(searchTerm)
        .map((result) => result.item)
    );
    return tracks.filter((track) => matches.has(track));
  });

  readonly #selectedArtist = signal<string | undefined>(undefined);
  protected readonly selectedAlbum = signal<string | undefined>(undefined);

  protected readonly uniqueArtists = computed(() => {
    const artists = new Set<string>();
    for (const track of this.#filteredBySearchTerm()) {
      if (track.artist) {
        artists.add(track.artist);
      }
    }
    return [...artists].toSorted(collator.compare);
  });

  protected readonly uniqueAlbums = computed(() => {
    const artist = this.#selectedArtist();
    const albumMap = new Map<string, Album>();

    for (const tag of this.#filteredBySearchTerm()) {
      if (!tag.album || (artist && tag.artist !== artist) || albumMap.has(tag.album)) {
        continue;
      }
      albumMap.set(tag.album, { name: tag.album, year: tag.year || '', coverUrl: tag.coverUrl });
    }

    return [...albumMap.values()].toSorted((a, b) => collator.compare(a.name, b.name));
  });

  protected readonly tracks = computed(() => {
    const artist = this.#selectedArtist();
    const album = this.selectedAlbum();

    return this.#filteredBySearchTerm().filter(
      (item) => (!artist || item.artist === artist) && (!album || item.album === album)
    );
  });
  ngOnInit() {
    void this.libraryService.loadLibraryFromDb();
  }

  protected selectArtist(artist: string | undefined) {
    this.#selectedArtist.set(artist);
    this.selectedAlbum.set(undefined);
  }

  protected selectAlbum(album: string | undefined) {
    this.selectedAlbum.set(album);
  }

  protected async playTrack(track: IndexedDbTrackMetadata | undefined) {
    if (!track) {
      return;
    }

    await this.addTrackToPlaylist(track);
    await this.#playerService.playTrackByHash(track.hash);
  }

  protected async addArtistToPlaylist(artist: string) {
    if (artist) {
      const tracks = this.#filteredBySearchTerm().filter((track) => track.artist === artist);
      await this.addTracksToPlaylist(...tracks);
    } else {
      await this.addTracksToPlaylist(...this.#filteredBySearchTerm());
    }
  }

  protected async addAlbumToPlaylist(album: Album) {
    let tracks: IndexedDbTrackMetadata[];
    if (album) {
      tracks = this.#filteredBySearchTerm().filter((track) => track.album === album.name);
    } else {
      // filter by all unique albums
      const albums = this.uniqueAlbums();

      tracks = [];
      for (const currentAlbum of albums) {
        const albumTracks = this.#filteredBySearchTerm().filter((track) => track.album === currentAlbum.name);
        tracks.push(...albumTracks);
      }
    }
    await this.addTracksToPlaylist(...tracks);
  }

  protected async addTrackToPlaylist(track: IndexedDbTrackMetadata) {
    if (track) {
      await this.addTracksToPlaylist(track);
    } else {
      const tracks = this.#filteredBySearchTerm();
      await this.addTracksToPlaylist(...tracks);
    }
  }

  protected async addTracksToPlaylist(...dbTracks: IndexedDbTrackMetadata[]) {
    const files = await Promise.all(dbTracks.map((dbTrack) => dbTrack.fileHandle?.getFile()));
    for (const [index, dbTrack] of dbTracks.entries()) {
      const file = files[index];
      if (file) {
        const track: Track = {
          file: file,
          fileHandle: dbTrack.fileHandle,
          metadata: dbTrack
        };

        this.#playerService.addTrackToPlaylist(track);
      } else {
        console.error('File not found for track:', dbTrack);
      }
    }
  }

  protected trackByArtist(index: number, artist: string): string {
    return artist;
  }

  protected trackByAlbum(index: number, album: Album): string {
    return album.name;
  }

  protected trackByHash(index: number, track: IndexedDbTrackMetadata): string {
    return track.hash;
  }

  protected async refreshLibrary() {
    await this.libraryService.loadLibraryFromDb();
  }
}
