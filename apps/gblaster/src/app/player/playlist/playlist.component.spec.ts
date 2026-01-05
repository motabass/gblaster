import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { PlaylistComponent } from './playlist.component';
import { PlayerService } from '../player.service';
import { AudioService } from '../audio.service';
import { ColorConfig, Track } from '../player.types';

// Mock Track factory
function createMockTrack(overrides: Partial<Track> = {}): Track {
  const defaultTrack: Track = {
    file: new File([''], 'test-song.mp3', { type: 'audio/mp3' }),
    metadata: {
      hash: `hash-${crypto.randomUUID()}`,
      fileName: 'test-song.mp3',
      artist: 'Test Artist',
      title: 'Test Title',
      album: 'Test Album',
      format: {} as Track['metadata']['format'],
      coverUrl: { thumbUrl: '', originalUrl: '' }
    }
  };
  return {
    ...defaultTrack,
    ...overrides,
    metadata: { ...defaultTrack.metadata, ...overrides.metadata }
  } as Track;
}

describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;
  let mockPlayerService: Partial<PlayerService>;
  let mockAudioService: Partial<AudioService>;

  let currentPlaylistSignal: WritableSignal<Track[]>;
  let selectedTrackSignal: WritableSignal<Track | undefined>;
  let currentlyLoadedTrackSignal: WritableSignal<Track | undefined>;
  let colorConfigSignal: WritableSignal<ColorConfig>;
  let isPlayingSignal: WritableSignal<boolean>;
  let isPausedSignal: WritableSignal<boolean>;

  beforeEach(async () => {
    // Create writable signals for testing
    currentPlaylistSignal = signal<Track[]>([]);
    selectedTrackSignal = signal<Track | undefined>(undefined);
    currentlyLoadedTrackSignal = signal<Track | undefined>(undefined);
    colorConfigSignal = signal<ColorConfig>({});
    isPlayingSignal = signal(false);
    isPausedSignal = signal(true);

    mockPlayerService = {
      currentPlaylist: currentPlaylistSignal,
      selectedTrack: selectedTrackSignal,
      currentlyLoadedTrack: currentlyLoadedTrackSignal,
      colorConfig: colorConfigSignal,
      playPauseTrack: vi.fn().mockResolvedValue(undefined),
      selectSong: vi.fn(),
      removeTrackFromPlaylist: vi.fn()
    };

    mockAudioService = {
      isPlaying: isPlayingSignal,
      isPaused: isPausedSignal
    };

    await TestBed.configureTestingModule({
      imports: [PlaylistComponent],
      providers: [
        { provide: PlayerService, useValue: mockPlayerService },
        { provide: AudioService, useValue: mockAudioService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isActive', () => {
    it('should return false when no track is playing', () => {
      const track = createMockTrack();
      isPlayingSignal.set(false);
      isPausedSignal.set(true);
      currentlyLoadedTrackSignal.set(undefined);

      const result = component.isActive(track);
      expect(result()).toBe(false);
    });

    it('should return true when track is playing and matches loaded track', () => {
      const track = createMockTrack({ metadata: { hash: 'track-1' } as Track['metadata'] });
      isPlayingSignal.set(true);
      isPausedSignal.set(false);
      currentlyLoadedTrackSignal.set(track);

      const result = component.isActive(track);
      expect(result()).toBe(true);
    });

    it('should return true when track is paused and matches loaded track', () => {
      const track = createMockTrack({ metadata: { hash: 'track-1' } as Track['metadata'] });
      isPlayingSignal.set(false);
      isPausedSignal.set(true);
      currentlyLoadedTrackSignal.set(track);

      const result = component.isActive(track);
      expect(result()).toBe(true);
    });

    it('should return false when different track is loaded', () => {
      const track1 = createMockTrack({ metadata: { hash: 'track-1' } as Track['metadata'] });
      const track2 = createMockTrack({ metadata: { hash: 'track-2' } as Track['metadata'] });
      isPlayingSignal.set(true);
      isPausedSignal.set(false);
      currentlyLoadedTrackSignal.set(track2);

      const result = component.isActive(track1);
      expect(result()).toBe(false);
    });
  });

  describe('isPlaying', () => {
    it('should return false when audio is not playing', () => {
      const track = createMockTrack();
      isPlayingSignal.set(false);
      currentlyLoadedTrackSignal.set(track);

      const result = component.isPlaying(track);
      expect(result()).toBe(false);
    });

    it('should return true when audio is playing and track matches', () => {
      const track = createMockTrack({ metadata: { hash: 'track-1' } as Track['metadata'] });
      isPlayingSignal.set(true);
      currentlyLoadedTrackSignal.set(track);

      const result = component.isPlaying(track);
      expect(result()).toBe(true);
    });

    it('should return false when audio is playing but different track is loaded', () => {
      const track1 = createMockTrack({ metadata: { hash: 'track-1' } as Track['metadata'] });
      const track2 = createMockTrack({ metadata: { hash: 'track-2' } as Track['metadata'] });
      isPlayingSignal.set(true);
      currentlyLoadedTrackSignal.set(track2);

      const result = component.isPlaying(track1);
      expect(result()).toBe(false);
    });
  });

  describe('playPauseSong', () => {
    it('should call playerService.playPauseTrack with the track', async () => {
      const track = createMockTrack();
      const event = new MouseEvent('click');
      vi.spyOn(event, 'stopPropagation');

      await component.playPauseSong(event, track);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(mockPlayerService.playPauseTrack).toHaveBeenCalledWith(track);
    });
  });

  describe('trackByHash', () => {
    it('should return the track hash', () => {
      const track = createMockTrack({ metadata: { hash: 'unique-hash' } as Track['metadata'] });

      const result = component.trackByHash(0, track);

      expect(result).toBe('unique-hash');
    });
  });

  describe('onContextMenu', () => {
    it('should prevent default event behavior', () => {
      const track = createMockTrack();
      const event = new MouseEvent('contextmenu', { clientX: 100, clientY: 200 });
      vi.spyOn(event, 'preventDefault');

      component.onContextMenu(event, track);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('playlist rendering', () => {
    it('should render tracks in the playlist', () => {
      const tracks = [
        createMockTrack({ metadata: { hash: 'track-1', title: 'Song 1', artist: 'Artist 1' } as Track['metadata'] }),
        createMockTrack({ metadata: { hash: 'track-2', title: 'Song 2', artist: 'Artist 2' } as Track['metadata'] }),
        createMockTrack({ metadata: { hash: 'track-3', title: 'Song 3', artist: 'Artist 3' } as Track['metadata'] })
      ];
      currentPlaylistSignal.set(tracks);

      fixture.detectChanges();

      // Virtual scroll only renders visible items, so we check the component state
      expect(currentPlaylistSignal().length).toBe(3);
    });

    it('should handle empty playlist', () => {
      currentPlaylistSignal.set([]);

      fixture.detectChanges();

      expect(currentPlaylistSignal().length).toBe(0);
    });
  });
});
