import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import LibraryComponent from './library.component';
import { PlayerService } from '../player.service';
import { LibraryService } from './library.service';
import { IndexedDbTrackMetadata } from '../player.types';
import { Album } from './library.types';
import { MatIconTestingModule } from '@angular/material/icon/testing';

// Mock IndexedDbTrackMetadata factory
function createMockTrackMetadata(overrides: Partial<IndexedDbTrackMetadata> = {}): IndexedDbTrackMetadata {
  const defaultMetadata: IndexedDbTrackMetadata = {
    hash: `hash-${crypto.randomUUID()}`,
    fileName: 'test-song.mp3',
    artist: 'Test Artist',
    title: 'Test Title',
    album: 'Test Album',
    year: '2024',
    track: '1',
    format: {
      duration: 180,
      container: 'MPEG',
      codec: 'MP3',
      bitrate: 320_000,
      sampleRate: 44_100
    } as IndexedDbTrackMetadata['format'],
    coverUrl: { thumbUrl: '', originalUrl: '' },
    fileHandle: {
      getFile: vi.fn().mockResolvedValue(new File([''], 'test-song.mp3', { type: 'audio/mp3' }))
    } as unknown as FileSystemFileHandle
  };
  return { ...defaultMetadata, ...overrides };
}

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;
  let mockPlayerService: Partial<PlayerService>;
  let mockLibraryService: Partial<LibraryService>;

  // Shared signals for testing
  let indexedDbTracksSignal: ReturnType<typeof signal<IndexedDbTrackMetadata[]>>;
  let isLoadingSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    // Initialize signals before each test
    indexedDbTracksSignal = signal<IndexedDbTrackMetadata[]>([]);
    isLoadingSignal = signal<boolean>(false);

    mockPlayerService = {
      addTrackToPlaylist: vi.fn(),
      playTrackByHash: vi.fn().mockResolvedValue(undefined)
    };

    mockLibraryService = {
      isLoading: isLoadingSignal,
      indexedDbTracks: indexedDbTracksSignal,
      loadLibraryFromDb: vi.fn().mockResolvedValue([]),
      removeTracks: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [LibraryComponent, MatIconTestingModule],
      providers: [
        { provide: PlayerService, useValue: mockPlayerService },
        { provide: LibraryService, useValue: mockLibraryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadLibraryFromDb on init', () => {
      expect(mockLibraryService.loadLibraryFromDb).toHaveBeenCalled();
    });
  });

  describe('uniqueArtists computed', () => {
    it('should return unique sorted artists', () => {
      const tracks = [
        createMockTrackMetadata({ artist: 'Zeta Artist' }),
        createMockTrackMetadata({ artist: 'Alpha Artist' }),
        createMockTrackMetadata({ artist: 'Alpha Artist' }), // duplicate
        createMockTrackMetadata({ artist: 'Beta Artist' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      const uniqueArtists = component['uniqueArtists']();
      expect(uniqueArtists).toEqual(['Alpha Artist', 'Beta Artist', 'Zeta Artist']);
    });

    it('should filter out undefined artists', () => {
      const tracks = [
        createMockTrackMetadata({ artist: 'Valid Artist' }),
        createMockTrackMetadata({ artist: undefined })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      const uniqueArtists = component['uniqueArtists']();
      expect(uniqueArtists).toEqual(['Valid Artist']);
    });

    it('should return empty array when no tracks', () => {
      indexedDbTracksSignal.set([]);
      fixture.detectChanges();

      const uniqueArtists = component['uniqueArtists']();
      expect(uniqueArtists).toEqual([]);
    });
  });

  describe('uniqueAlbums computed', () => {
    it('should return unique sorted albums', () => {
      const tracks = [
        createMockTrackMetadata({
          album: 'Zeta Album',
          year: '2020',
          coverUrl: { thumbUrl: 'z.jpg', originalUrl: '' }
        }),
        createMockTrackMetadata({
          album: 'Alpha Album',
          year: '2021',
          coverUrl: { thumbUrl: 'a.jpg', originalUrl: '' }
        }),
        createMockTrackMetadata({
          album: 'Alpha Album',
          year: '2021',
          coverUrl: { thumbUrl: 'a.jpg', originalUrl: '' }
        }) // duplicate
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      const uniqueAlbums = component['uniqueAlbums']();
      expect(uniqueAlbums).toHaveLength(2);
      expect(uniqueAlbums[0].name).toBe('Alpha Album');
      expect(uniqueAlbums[1].name).toBe('Zeta Album');
    });

    it('should filter albums by selected artist', () => {
      const tracks = [
        createMockTrackMetadata({ artist: 'Artist A', album: 'Album A' }),
        createMockTrackMetadata({ artist: 'Artist B', album: 'Album B' })
      ];
      indexedDbTracksSignal.set(tracks);

      component['selectArtist']('Artist A');
      fixture.detectChanges();

      const uniqueAlbums = component['uniqueAlbums']();
      expect(uniqueAlbums).toHaveLength(1);
      expect(uniqueAlbums[0].name).toBe('Album A');
    });

    it('should filter out tracks without albums', () => {
      const tracks = [
        createMockTrackMetadata({ album: 'Valid Album' }),
        createMockTrackMetadata({ album: undefined }),
        createMockTrackMetadata({ album: '' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      const uniqueAlbums = component['uniqueAlbums']();
      expect(uniqueAlbums).toHaveLength(1);
      expect(uniqueAlbums[0].name).toBe('Valid Album');
    });
  });

  describe('tracks computed', () => {
    it('should return all tracks when no filters', () => {
      const tracks = [
        createMockTrackMetadata({ title: 'Song 1' }),
        createMockTrackMetadata({ title: 'Song 2' }),
        createMockTrackMetadata({ title: 'Song 3' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      expect(component['tracks']()).toHaveLength(3);
    });

    it('should filter tracks by selected artist', () => {
      const tracks = [
        createMockTrackMetadata({ artist: 'Artist A', title: 'Song A' }),
        createMockTrackMetadata({ artist: 'Artist B', title: 'Song B' })
      ];
      indexedDbTracksSignal.set(tracks);

      component['selectArtist']('Artist A');
      fixture.detectChanges();

      const filteredTracks = component['tracks']();
      expect(filteredTracks).toHaveLength(1);
      expect(filteredTracks[0].title).toBe('Song A');
    });

    it('should filter tracks by selected album', () => {
      const tracks = [
        createMockTrackMetadata({ album: 'Album A', title: 'Song A' }),
        createMockTrackMetadata({ album: 'Album B', title: 'Song B' })
      ];
      indexedDbTracksSignal.set(tracks);

      component['selectAlbum']('Album A');
      fixture.detectChanges();

      const filteredTracks = component['tracks']();
      expect(filteredTracks).toHaveLength(1);
      expect(filteredTracks[0].title).toBe('Song A');
    });

    it('should sort tracks by artist, album, track number, then title', () => {
      const tracks = [
        createMockTrackMetadata({ artist: 'Beta', album: 'Album', track: '2', title: 'Track 2' }),
        createMockTrackMetadata({ artist: 'Alpha', album: 'Album', track: '1', title: 'Track 1' }),
        createMockTrackMetadata({ artist: 'Alpha', album: 'Album', track: '3', title: 'Track 3' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      const sortedTracks = component['tracks']();
      expect(sortedTracks[0].artist).toBe('Alpha');
      expect(sortedTracks[0].track).toBe('1');
      expect(sortedTracks[1].track).toBe('3');
      expect(sortedTracks[2].artist).toBe('Beta');
    });
  });

  describe('selection methods', () => {
    it('highlights the last clicked track in the library', () => {
      const firstTrack = createMockTrackMetadata({ hash: 'first-track' });
      const secondTrack = createMockTrackMetadata({ hash: 'second-track' });
      indexedDbTracksSignal.set([firstTrack, secondTrack]);
      fixture.detectChanges();

      const trackItems = fixture.nativeElement.querySelectorAll('.tracks mat-list-item');
      trackItems[1].click();
      fixture.detectChanges();
      expect(trackItems[1].classList).toContain('selected');
      expect(trackItems[2].classList).not.toContain('selected');

      trackItems[2].click();
      fixture.detectChanges();
      expect(trackItems[1].classList).not.toContain('selected');
      expect(trackItems[2].classList).toContain('selected');
    });

    it('highlights the selected artist and album', () => {
      indexedDbTracksSignal.set([
        createMockTrackMetadata({ artist: 'Artist A', album: 'Album A' }),
        createMockTrackMetadata({ artist: 'Artist B', album: 'Album B' })
      ]);
      fixture.detectChanges();

      const allArtists = fixture.nativeElement.querySelector('.artists mat-list-item');
      const allAlbums = fixture.nativeElement.querySelector('.albums mat-list-item');
      expect(allArtists.classList).toContain('selected');
      expect(allAlbums.classList).toContain('selected');

      component['selectArtist']('Artist A');
      fixture.detectChanges();

      const artistItems = fixture.nativeElement.querySelectorAll('.artists mat-list-item');
      expect(artistItems[0].classList).not.toContain('selected');
      expect(artistItems[1].classList).toContain('selected');

      component['selectAlbum']('Album A');
      fixture.detectChanges();

      const albumItems = fixture.nativeElement.querySelectorAll('.albums mat-list-item');
      expect(albumItems[0].classList).not.toContain('selected');
      expect(albumItems[1].classList).toContain('selected');
    });

    it('selectArtist should set artist and reset album', () => {
      indexedDbTracksSignal.set([
        createMockTrackMetadata({ artist: 'New Artist', album: 'Some Album', title: 'Song A' }),
        createMockTrackMetadata({ artist: 'New Artist', album: 'Other Album', title: 'Song B' }),
        createMockTrackMetadata({ artist: 'Other Artist', album: 'Some Album', title: 'Song C' })
      ]);
      component['selectAlbum']('Some Album');

      component['selectArtist']('New Artist');

      expect(component['tracks']().map((track) => track.title)).toEqual(['Song B', 'Song A']);
      expect(component['selectedAlbum']()).toBeUndefined();
    });

    it('selectAlbum should set album', () => {
      component['selectAlbum']('New Album');

      expect(component['selectedAlbum']()).toBe('New Album');
    });
  });

  describe('playlist methods', () => {
    it('playTrack should add track to playlist and play it', async () => {
      const track = createMockTrackMetadata({ hash: 'test-hash' });

      await component['playTrack'](track);

      expect(mockPlayerService.addTrackToPlaylist).toHaveBeenCalled();
      expect(mockPlayerService.playTrackByHash).toHaveBeenCalledWith('test-hash');
    });

    it('playTrack should do nothing when track is undefined', async () => {
      await component['playTrack'](undefined);

      expect(mockPlayerService.addTrackToPlaylist).not.toHaveBeenCalled();
      expect(mockPlayerService.playTrackByHash).not.toHaveBeenCalled();
    });

    it('addArtistToPlaylist should add all tracks by artist', async () => {
      const tracks = [
        createMockTrackMetadata({ artist: 'Artist A', title: 'Song 1' }),
        createMockTrackMetadata({ artist: 'Artist A', title: 'Song 2' }),
        createMockTrackMetadata({ artist: 'Artist B', title: 'Song 3' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      await component['addArtistToPlaylist']('Artist A');

      expect(mockPlayerService.addTrackToPlaylist).toHaveBeenCalledTimes(2);
    });

    it('addAlbumToPlaylist should add all tracks from album', async () => {
      const tracks = [
        createMockTrackMetadata({ album: 'Album A', title: 'Song 1' }),
        createMockTrackMetadata({ album: 'Album A', title: 'Song 2' }),
        createMockTrackMetadata({ album: 'Album B', title: 'Song 3' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      const album: Album = {
        name: 'Album A',
        year: '2024',
        coverUrl: { thumbUrl: '', originalUrl: '' }
      };
      await component['addAlbumToPlaylist'](album);

      expect(mockPlayerService.addTrackToPlaylist).toHaveBeenCalledTimes(2);
    });

    it('removeArtistFromLibrary should remove tracks by the selected artist', async () => {
      indexedDbTracksSignal.set([
        createMockTrackMetadata({ hash: 'artist-a-1', artist: 'Artist A' }),
        createMockTrackMetadata({ hash: 'artist-a-2', artist: 'Artist A' }),
        createMockTrackMetadata({ hash: 'artist-b', artist: 'Artist B' })
      ]);
      fixture.detectChanges();

      await component['removeArtistFromLibrary']('Artist A');

      expect(mockLibraryService.removeTracks).toHaveBeenCalledWith([
        expect.objectContaining({ hash: 'artist-a-1' }),
        expect.objectContaining({ hash: 'artist-a-2' })
      ]);
    });

    it('removeAlbumFromLibrary should remove tracks from the selected album', async () => {
      indexedDbTracksSignal.set([
        createMockTrackMetadata({ hash: 'album-a-1', album: 'Album A' }),
        createMockTrackMetadata({ hash: 'album-a-2', album: 'Album A' }),
        createMockTrackMetadata({ hash: 'album-b', album: 'Album B' })
      ]);
      fixture.detectChanges();

      await component['removeAlbumFromLibrary']({
        name: 'Album A',
        year: '2024',
        coverUrl: { thumbUrl: '', originalUrl: '' }
      });

      expect(mockLibraryService.removeTracks).toHaveBeenCalledWith([
        expect.objectContaining({ hash: 'album-a-1' }),
        expect.objectContaining({ hash: 'album-a-2' })
      ]);
    });

    it('removeTrackFromLibrary should remove the selected track', async () => {
      const track = createMockTrackMetadata({ hash: 'track-hash' });

      await component['removeTrackFromLibrary'](track);

      expect(mockLibraryService.removeTracks).toHaveBeenCalledWith([track]);
    });

    it('addTrackToPlaylist should add single track', async () => {
      const track = createMockTrackMetadata({ title: 'Single Track' });

      await component['addTrackToPlaylist'](track);

      expect(mockPlayerService.addTrackToPlaylist).toHaveBeenCalledTimes(1);
    });
  });

  describe('trackBy functions', () => {
    it('trackByArtist should return artist name', () => {
      expect(component['trackByArtist'](0, 'Test Artist')).toBe('Test Artist');
    });

    it('trackByAlbum should return album name', () => {
      const album: Album = { name: 'Test Album', year: '2024', coverUrl: { thumbUrl: '', originalUrl: '' } };
      expect(component['trackByAlbum'](0, album)).toBe('Test Album');
    });

    it('trackByHash should return track hash', () => {
      const track = createMockTrackMetadata({ hash: 'unique-hash' });
      expect(component['trackByHash'](0, track)).toBe('unique-hash');
    });
  });

  describe('refreshLibrary', () => {
    it('should call loadLibraryFromDb', async () => {
      vi.clearAllMocks();

      await component['refreshLibrary']();

      expect(mockLibraryService.loadLibraryFromDb).toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should filter tracks by search term', async () => {
      const tracks = [
        createMockTrackMetadata({ title: 'Hello World', artist: 'Artist A' }),
        createMockTrackMetadata({ title: 'Goodbye', artist: 'Artist B' }),
        createMockTrackMetadata({ title: 'Hello Again', artist: 'Artist C' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      // Set search term
      component['searchTermForm'].searchTerm().value.set('Hello');
      await vi.advanceTimersByTimeAsync(350); // Wait for debounce
      fixture.detectChanges();

      const filteredTracks = component['tracks']();
      expect(filteredTracks).toHaveLength(2);
      expect(filteredTracks.every((t) => t.title?.includes('Hello'))).toBe(true);
    });

    it('should return all tracks when search term is empty', async () => {
      const tracks = [
        createMockTrackMetadata({ title: 'Song 1' }),
        createMockTrackMetadata({ title: 'Song 2' }),
        createMockTrackMetadata({ title: 'Song 3' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      component['searchTermForm'].searchTerm().value.set('');
      await vi.advanceTimersByTimeAsync(350);
      fixture.detectChanges();

      expect(component['tracks']()).toHaveLength(3);
    });

    it('should search by artist name', async () => {
      const tracks = [
        createMockTrackMetadata({ title: 'Song 1', artist: 'John Doe' }),
        createMockTrackMetadata({ title: 'Song 2', artist: 'Jane Smith' }),
        createMockTrackMetadata({ title: 'Song 3', artist: 'John Wayne' })
      ];
      indexedDbTracksSignal.set(tracks);
      fixture.detectChanges();

      component['searchTermForm'].searchTerm().value.set('John');
      await vi.advanceTimersByTimeAsync(350);
      fixture.detectChanges();

      const filteredTracks = component['tracks']();
      expect(filteredTracks).toHaveLength(2);
    });
  });

  describe('loading state', () => {
    it('should reflect loading state from libraryService', () => {
      isLoadingSignal.set(true);
      fixture.detectChanges();

      expect(component['libraryService'].isLoading()).toBe(true);

      isLoadingSignal.set(false);
      fixture.detectChanges();

      expect(component['libraryService'].isLoading()).toBe(false);
    });
  });
});
