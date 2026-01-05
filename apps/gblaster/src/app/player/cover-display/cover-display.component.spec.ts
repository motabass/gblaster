import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { CoverDisplayComponent } from './cover-display.component';
import { PlayerService } from '../player.service';
import { ThemeService } from '../../theme/theme.service';
import { Track } from '../player.types';
import { VisualizerComponent } from '../visualizer/visualizer.component';

// Mock VisualizerComponent to avoid complex dependencies
@Component({
  selector: 'mtb-visualizer',
  template: ''
})
class MockVisualizerComponent {}

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
      year: '2024',
      format: {
        duration: 180,
        container: 'MPEG',
        codec: 'MP3',
        bitrate: 320000,
        sampleRate: 44100
      } as Track['metadata']['format'],
      coverUrl: { thumbUrl: '', originalUrl: 'https://example.com/cover.jpg' },
      coverColors: {
        vibrant: { hex: '#ff0000' },
        darkVibrant: { hex: '#cc0000' },
        lightVibrant: { hex: '#ff6666' },
        muted: { hex: '#666666' },
        darkMuted: { hex: '#333333' },
        lightMuted: { hex: '#999999' }
      }
    }
  };
  return {
    ...defaultTrack,
    ...overrides,
    metadata: { ...defaultTrack.metadata, ...overrides.metadata }
  } as Track;
}

describe('CoverDisplayComponent', () => {
  let component: CoverDisplayComponent;
  let fixture: ComponentFixture<CoverDisplayComponent>;
  let mockPlayerService: Partial<PlayerService>;
  let mockThemeService: Partial<ThemeService>;

  // Shared signals for testing
  let currentlyLoadedTrackSignal: ReturnType<typeof signal<Track | undefined>>;
  let darkModeSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    // Initialize signals before each test
    currentlyLoadedTrackSignal = signal<Track | undefined>(undefined);
    darkModeSignal = signal<boolean>(false);

    mockPlayerService = {
      currentlyLoadedTrack: currentlyLoadedTrackSignal
    };

    mockThemeService = {
      darkMode: darkModeSignal
    };

    await TestBed.configureTestingModule({
      imports: [CoverDisplayComponent],
      providers: [
        { provide: PlayerService, useValue: mockPlayerService },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    })
      .overrideComponent(CoverDisplayComponent, {
        remove: { imports: [VisualizerComponent] },
        add: { imports: [MockVisualizerComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CoverDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('coverUrl computed', () => {
    it('should return undefined when no track is loaded', () => {
      currentlyLoadedTrackSignal.set(undefined);
      fixture.detectChanges();

      expect(component['coverUrl']()).toBeUndefined();
    });

    it('should return the originalUrl when a track is loaded', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      expect(component['coverUrl']()).toBe('https://example.com/cover.jpg');
    });

    it('should return undefined when track has no coverUrl', () => {
      const track = createMockTrack({
        metadata: {
          hash: 'test',
          fileName: 'test.mp3',
          format: {} as Track['metadata']['format'],
          coverUrl: { thumbUrl: '', originalUrl: '' }
        }
      });
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      // Empty string is falsy but still returned
      expect(component['coverUrl']()).toBe('');
    });
  });

  describe('backgroundColor computed', () => {
    it('should return transparent when no track is loaded', () => {
      currentlyLoadedTrackSignal.set(undefined);
      fixture.detectChanges();

      expect(component['backgroundColor']()).toBe('rgba(0,0,0,0)');
    });

    it('should return lightMuted color in light mode', () => {
      darkModeSignal.set(false);
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      expect(component['backgroundColor']()).toBe('#999999');
    });

    it('should return darkMuted color in dark mode', () => {
      darkModeSignal.set(true);
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      expect(component['backgroundColor']()).toBe('#333333');
    });

    it('should return transparent when track has no coverColors', () => {
      const track = createMockTrack({
        metadata: {
          hash: 'test',
          fileName: 'test.mp3',
          format: {} as Track['metadata']['format'],
          coverUrl: { thumbUrl: '', originalUrl: '' },
          coverColors: undefined
        }
      });
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      expect(component['backgroundColor']()).toBe('rgba(0,0,0,0)');
    });

    it('should return transparent when coverColors has no muted colors', () => {
      const track = createMockTrack({
        metadata: {
          hash: 'test',
          fileName: 'test.mp3',
          format: {} as Track['metadata']['format'],
          coverUrl: { thumbUrl: '', originalUrl: '' },
          coverColors: {
            vibrant: { hex: '#ff0000' }
          }
        }
      });
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      expect(component['backgroundColor']()).toBe('rgba(0,0,0,0)');
    });
  });

  describe('template rendering', () => {
    it('should display track title when available', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.track-title');
      expect(titleElement.textContent.trim()).toBe('Test Title');
    });

    it('should display filename when no title is available', () => {
      const track = createMockTrack({
        metadata: {
          hash: 'test',
          fileName: 'my-song.mp3',
          title: undefined,
          format: {} as Track['metadata']['format'],
          coverUrl: { thumbUrl: '', originalUrl: '' }
        }
      });
      // Also set file name
      track.file = new File([''], 'my-song.mp3', { type: 'audio/mp3' });
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.track-title');
      expect(titleElement.textContent.trim()).toBe('my-song.mp3');
    });

    it('should display artist when available', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const artistElement = fixture.nativeElement.querySelector('.track-artist');
      expect(artistElement.textContent.trim()).toBe('Test Artist');
    });

    it('should display album when available', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const metadataInfo = fixture.nativeElement.querySelector('.metadata-info');
      expect(metadataInfo.textContent).toContain('Test Album');
    });

    it('should display year when available', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const metadataInfo = fixture.nativeElement.querySelector('.metadata-info');
      expect(metadataInfo.textContent).toContain('2024');
    });

    it('should not display album section when no album is available', () => {
      const track = createMockTrack({
        metadata: {
          hash: 'test',
          fileName: 'test.mp3',
          album: undefined,
          format: {} as Track['metadata']['format'],
          coverUrl: { thumbUrl: '', originalUrl: '' }
        }
      });
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const metadataInfo = fixture.nativeElement.querySelector('.metadata-info');
      expect(metadataInfo.textContent).not.toContain('Album:');
    });

    it('should display cover image when track and coverUrl are available', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const coverImg = fixture.nativeElement.querySelector('.cover-img');
      expect(coverImg).toBeTruthy();
      expect(coverImg.style.backgroundImage).toContain('https://example.com/cover.jpg');
    });

    it('should not display cover image when no track is loaded', () => {
      currentlyLoadedTrackSignal.set(undefined);
      fixture.detectChanges();

      const coverImg = fixture.nativeElement.querySelector('.cover-img');
      expect(coverImg).toBeFalsy();
    });

    it('should display color palette when coverColors are available', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const colorSwatches = fixture.nativeElement.querySelectorAll('.color-swatch');
      expect(colorSwatches.length).toBe(6);
    });

    it('should not display color palette when no coverColors', () => {
      const track = createMockTrack({
        metadata: {
          hash: 'test',
          fileName: 'test.mp3',
          format: {} as Track['metadata']['format'],
          coverUrl: { thumbUrl: '', originalUrl: '' },
          coverColors: undefined
        }
      });
      currentlyLoadedTrackSignal.set(track);
      fixture.detectChanges();

      const colorPaletteContainer = fixture.nativeElement.querySelector('.color-palette-container');
      expect(colorPaletteContainer).toBeFalsy();
    });

    it('should include visualizer component', () => {
      const visualizer = fixture.nativeElement.querySelector('mtb-visualizer');
      expect(visualizer).toBeTruthy();
    });
  });

  describe('dark mode switching', () => {
    it('should update backgroundColor when dark mode changes', () => {
      const track = createMockTrack();
      currentlyLoadedTrackSignal.set(track);

      darkModeSignal.set(false);
      fixture.detectChanges();
      expect(component['backgroundColor']()).toBe('#999999'); // lightMuted

      darkModeSignal.set(true);
      fixture.detectChanges();
      expect(component['backgroundColor']()).toBe('#333333'); // darkMuted
    });
  });
});
