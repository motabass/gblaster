import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { IndexedDbTrackMetadata, Track } from '../player.types';
import { NgArrayPipesModule } from 'ngx-pipes';
import { MatListModule } from '@angular/material/list';
import { firstValueFrom } from 'rxjs';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PlayerService } from '../player.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgOptimizedImage } from '@angular/common';
import { SafePipe } from 'safe-pipe';
import { Router } from '@angular/router';
import { RemoteCoverPicture } from '../metadata-service/metadata.types';

export interface Album {
  name: string;
  coverUrl: RemoteCoverPicture;
}

@Component({
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
  imports: [
    MatListModule,
    NgArrayPipesModule,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    MatIconButton,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    NgOptimizedImage,
    SafePipe
  ]
})
export default class LibraryComponent implements OnInit {
  private indexedDbService = inject(NgxIndexedDBService);
  private playerService = inject(PlayerService);
  private router = inject(Router);

  private readonly data = signal<IndexedDbTrackMetadata[]>([]);

  readonly selectedArtist = signal<string | undefined>(undefined);
  readonly selectedAlbum = signal<string | undefined>(undefined);
  readonly selectedTrack = signal<IndexedDbTrackMetadata | undefined>(undefined);

  readonly uniqueArtists = computed(() => {
    const filtered = this.data()
      .map((tag) => tag.artist)
      .filter((artist): artist is string => !!artist);

    return [...new Set(filtered)];
  });

  readonly uniqueAlbums = computed(() => {
    let filtered = this.data();
    const artist = this.selectedArtist();

    if (artist) {
      filtered = filtered.filter((item) => item.artist === artist && !!item.album);
    } else {
      filtered = filtered.filter((item) => !!item.album);
    }

    // Map to store unique albums by name
    const albumMap = new Map<string, Album>();

    for (const tag of filtered) {
      const albumName = tag.album || '';
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, {
          name: albumName,
          coverUrl: tag.coverUrl
        });
      }
    }

    return [...albumMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly tracks = computed(() => {
    let filtered = this.data();
    const artist = this.selectedArtist();
    const album = this.selectedAlbum();

    if (artist) {
      filtered = filtered.filter((item) => item.artist === artist);
    }

    if (album) {
      filtered = filtered.filter((item) => item.album === album);
    }

    // Sort tracks by artist, then album, then track number (if available), then title
    return filtered.sort((a, b) => {
      // Compare artists first
      const artistCompare = (a.artist || '').localeCompare(b.artist || '');
      if (artistCompare !== 0) return artistCompare;

      // Then compare albums
      const albumCompare = (a.album || '').localeCompare(b.album || '');
      if (albumCompare !== 0) return albumCompare;

      // Then use track number if available
      const aTrack = a.track !== undefined ? Number(a.track) : NaN;
      const bTrack = b.track !== undefined ? Number(b.track) : NaN;

      // If both tracks have track numbers, compare them
      if (!isNaN(aTrack) && !isNaN(bTrack)) {
        return aTrack - bTrack;
      }

      // Otherwise, fall back to title comparison
      return (a.title || '').localeCompare(b.title || '');
    });
  });

  async ngOnInit() {
    try {
      const result = await firstValueFrom(this.indexedDbService.getAll<IndexedDbTrackMetadata>('metatags'));
      this.data.set(result || []);
    } catch (error) {
      console.error('Error loading library data:', error);
    }
  }

  selectArtist(artist: string | undefined) {
    this.selectedArtist.set(artist);
    this.selectedAlbum.set(undefined);
    this.selectedTrack.set(undefined);
  }

  selectAlbum(album: string | undefined) {
    this.selectedAlbum.set(album);
    this.selectedTrack.set(undefined);
  }

  selectTrack(track: IndexedDbTrackMetadata | undefined) {
    if (track) {
      this.selectedTrack.set(track);
    }
  }

  async playTrack(track: IndexedDbTrackMetadata | undefined) {
    if (track) {
      await this.addTrackToPlaylist(track);
      void this.router.navigate(['/player']);
    }
  }

  async addAlbumToPlaylist(album: Album) {
    const tracks = this.data().filter((track) => track.album === album.name);
    await this.addTracksToPlaylist(...tracks);
  }

  async addTrackToPlaylist(track: IndexedDbTrackMetadata) {
    await this.addTracksToPlaylist(track);
  }

  async addTracksToPlaylist(...dbTracks: IndexedDbTrackMetadata[]) {
    for (const dbTrack of dbTracks) {
      const file = await dbTrack.fileHandle?.getFile();
      if (file) {
        const track: Track = {
          file: file,
          fileHandle: dbTrack.fileHandle,
          metadata: dbTrack
        };

        this.playerService.addTrackToPlaylist(track);
      } else {
        console.error('File not found for track:', dbTracks);
      }
    }
  }
}
