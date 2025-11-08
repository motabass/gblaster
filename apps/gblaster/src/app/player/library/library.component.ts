import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IndexedDbTrackMetadata, Track } from '../player.types';
import { MatListItem, MatListItemAvatar, MatListItemMeta, MatListItemTitle, MatNavList } from '@angular/material/list';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PlayerService } from '../player.service';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { SafePipe } from 'safe-pipe';
import { RemoteCoverArtUrls } from '../metadata-service/metadata.types';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatHint, MatInput, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LibraryService } from './library.service';

export interface Album {
  name: string;
  year: string;
  coverUrl: RemoteCoverArtUrls;
}

@Component({
  imports: [
    MatNavList,
    MatListItem,
    MatListItemTitle,
    MatListItemMeta,
    MatListItemAvatar,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    MatIconButton,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    SafePipe,
    MatHint,
    FormsModule,
    MatFormField,
    MatInput,
    MatPrefix,
    MatSuffix,
    MatProgressSpinner
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss'
})
export default class LibraryComponent implements OnInit {
  private readonly playerService = inject(PlayerService);
  protected readonly libraryService = inject(LibraryService);

  protected readonly searchTerm = signal('');

  private readonly filteredBySerchterm = computed(() => {
    const searchTerm = this.searchTerm();
    const lowerSearchTerm = searchTerm.toLowerCase();
    return this.libraryService.indexedDbTracks().filter((tag) => {
      return (
        tag.title?.toLowerCase().includes(lowerSearchTerm) ||
        tag.artist?.toLowerCase().includes(lowerSearchTerm) ||
        tag.fileName?.toLowerCase().includes(lowerSearchTerm) ||
        tag.album?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  });

  private readonly selectedArtist = signal<string | undefined>(undefined);
  protected readonly selectedAlbum = signal<string | undefined>(undefined);
  private readonly selectedTrack = signal<IndexedDbTrackMetadata | undefined>(undefined);

  protected readonly uniqueArtists = computed(() => {
    const filtered = this.filteredBySerchterm()
      .map((tag) => tag.artist)
      .filter((artist): artist is string => !!artist);

    return [...new Set(filtered.toSorted((a, b) => a.localeCompare(b)))];
  });

  protected readonly uniqueAlbums = computed(() => {
    let filtered = this.filteredBySerchterm();
    const artist = this.selectedArtist();

    filtered = artist
      ? filtered.filter((item) => item.artist === artist && !!item.album)
      : filtered.filter((item) => !!item.album);

    // Map to store unique albums by name
    const albumMap = new Map<string, Album>();

    for (const tag of filtered) {
      const albumName = tag.album || '';
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, {
          name: albumName,
          year: tag.year || '',
          coverUrl: tag.coverUrl
        });
      }
    }

    return [...albumMap.values()].toSorted((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly tracks = computed(() => {
    this.searchTerm();

    let filtered = this.filteredBySerchterm();
    const artist = this.selectedArtist();
    const album = this.selectedAlbum();

    if (artist) {
      filtered = filtered.filter((item) => item.artist === artist);
    }

    if (album) {
      filtered = filtered.filter((item) => item.album === album);
    }

    // Sort tracks by artist, then album, then track number (if available), then title
    return filtered.toSorted((a, b) => {
      // Compare artists first
      const artistCompare = (a.artist || '').localeCompare(b.artist || '');
      if (artistCompare !== 0) return artistCompare;

      // Then compare albums
      const albumCompare = (a.album || '').localeCompare(b.album || '');
      if (albumCompare !== 0) return albumCompare;

      // Then use track number if available
      const aTrack = a.track === undefined ? Number.NaN : Number(a.track);
      const bTrack = b.track === undefined ? Number.NaN : Number(b.track);

      // If both tracks have track numbers, compare them
      if (!Number.isNaN(aTrack) && !Number.isNaN(bTrack)) {
        return aTrack - bTrack;
      }

      // Otherwise, fall back to title comparison
      return (a.title || '').localeCompare(b.title || '');
    });
  });

  ngOnInit() {
    void this.libraryService.loadLibraryFromDb();
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
      await this.playerService.playTrackByHash(track.hash);
      // void this.router.navigate(['/player']);
    }
  }

  async addArtistToPlaylist(artist: string) {
    if (artist) {
      const tracks = this.filteredBySerchterm().filter((track) => track.artist === artist);
      await this.addTracksToPlaylist(...tracks);
    } else {
      await this.addTracksToPlaylist(...this.filteredBySerchterm());
    }
  }

  async addAlbumToPlaylist(album: Album) {
    if (album) {
      const tracks = this.filteredBySerchterm().filter((track) => track.album === album.name);
      await this.addTracksToPlaylist(...tracks);
    } else {
      // filter by all unique albums
      const albums = this.uniqueAlbums();

      const tracks: IndexedDbTrackMetadata[] = [];
      for (const currentAlbum of albums) {
        const albumTracks = this.filteredBySerchterm().filter((track) => track.album === currentAlbum.name);
        tracks.push(...albumTracks);
      }
      await this.addTracksToPlaylist(...tracks);
    }
  }

  async addTrackToPlaylist(track: IndexedDbTrackMetadata) {
    if (track) {
      await this.addTracksToPlaylist(track);
    } else {
      const tracks = this.filteredBySerchterm();
      await this.addTracksToPlaylist(...tracks);
    }
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

  trackByArtist(index: number, artist: string): string {
    return artist;
  }

  trackByAlbum(index: number, album: Album): string {
    return album.name;
  }

  trackByHash(index: number, track: IndexedDbTrackMetadata): string {
    return track.hash;
  }

  async refreshLibrary() {
    await this.libraryService.loadLibraryFromDb();
  }
}
