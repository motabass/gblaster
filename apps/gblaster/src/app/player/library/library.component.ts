import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { IndexedDbTrackMetadata, Track } from '../player.types';
import { NgArrayPipesModule } from 'ngx-pipes';
import { MatListModule } from '@angular/material/list';
import { firstValueFrom } from 'rxjs';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { PlayerService } from '../player.service';

@Component({
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
  imports: [MatListModule, NgArrayPipesModule, MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger]
})
export default class LibraryComponent implements OnInit {
  private indexedDbService = inject(NgxIndexedDBService);
  private playerService = inject(PlayerService);

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  private readonly data = signal<IndexedDbTrackMetadata[]>([]);

  readonly selectedArtist = signal<string | null>(null);
  readonly selectedAlbum = signal<string | null>(null);
  readonly selectedTrack = signal<IndexedDbTrackMetadata | null>(null);

  readonly artists = computed(() => {
    return this.data()
      .map((tag) => tag.artist)
      .filter((artist): artist is string => !!artist);
  });

  readonly albums = computed(() => {
    let filtered = this.data();
    const artist = this.selectedArtist();

    if (artist) {
      filtered = filtered.filter((item) => item.artist === artist);
    }

    return filtered.map((tag) => tag.album).filter((album): album is string => !!album);
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

    return filtered;
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
    if (artist) {
      this.selectedArtist.set(artist);
      this.selectedAlbum.set(null);
      this.selectedTrack.set(null);
    }
  }

  selectAlbum(album: string | undefined) {
    if (album) {
      this.selectedAlbum.set(album);
      this.selectedTrack.set(null);
    }
  }

  selectTrack(track: IndexedDbTrackMetadata | undefined) {
    if (track) {
      this.selectedTrack.set(track);
    }
  }

  onContextMenu(event: MouseEvent, track: IndexedDbTrackMetadata): boolean {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { track };
    this.contextMenu.openMenu();
    return false;
  }

  async addToPlaylist(dbTrack: IndexedDbTrackMetadata) {
    const file = await dbTrack.fileHandle?.getFile();
    if (file) {
      const track: Track = {
        file: file,
        fileHandle: dbTrack.fileHandle,
        metadata: dbTrack
      };

      this.playerService.addTrackToPlaylist(track);
    } else {
      console.error('File not found for track:', dbTrack);
    }
  }
}
