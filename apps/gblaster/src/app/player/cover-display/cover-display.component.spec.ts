import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CoverDisplayComponent } from './cover-display.component';
import { ThemeService } from '../../theme/theme.service';
import { TrackMetadata } from '../player.types';

function createTrackMetadata(overrides: Partial<TrackMetadata> = {}): TrackMetadata {
  return {
    hash: 'track-hash',
    fileName: 'track.mp3',
    artist: 'Test Artist',
    title: 'Test Title',
    album: 'Test Album',
    year: '2024',
    format: {
      duration: 180,
      container: 'MPEG',
      codec: 'MP3',
      bitrate: 320_000,
      sampleRate: 44_100
    } as TrackMetadata['format'],
    coverUrl: { thumbUrl: '', originalUrl: 'https://example.com/cover.jpg' },
    coverColors: {
      vibrant: { hex: '#ff0000' },
      darkVibrant: { hex: '#cc0000' },
      lightVibrant: { hex: '#ff6666' },
      muted: { hex: '#666666' },
      darkMuted: { hex: '#333333' },
      lightMuted: { hex: '#999999' }
    },
    ...overrides
  };
}

describe('CoverDisplayComponent', () => {
  let fixture: ComponentFixture<CoverDisplayComponent>;
  const darkMode = signal(false);

  beforeEach(async () => {
    darkMode.set(false);

    await TestBed.configureTestingModule({
      imports: [CoverDisplayComponent],
      providers: [{ provide: ThemeService, useValue: { darkMode } }]
    }).compileComponents();

    fixture = TestBed.createComponent(CoverDisplayComponent);
    fixture.detectChanges();
  });

  function renderMetadata(metadata: TrackMetadata | null = null) {
    fixture.componentRef.setInput('trackMetadata', metadata);
    fixture.detectChanges();
  }

  it('renders track metadata and cover art from its input', () => {
    renderMetadata(createTrackMetadata());

    expect(fixture.nativeElement.querySelector('.track-title').textContent.trim()).toBe('Test Title');
    expect(fixture.nativeElement.querySelector('.track-artist').textContent.trim()).toBe('Test Artist');
    expect(fixture.nativeElement.querySelector('.metadata-info').textContent).toContain('Test Album');
    expect(fixture.nativeElement.querySelector('.cover-img').style.backgroundImage).toContain(
      'https://example.com/cover.jpg'
    );
    expect(fixture.nativeElement.querySelectorAll('.color-swatch')).toHaveLength(6);
  });

  it('uses the filename when the title is missing', () => {
    renderMetadata(createTrackMetadata({ title: undefined, fileName: 'untitled.mp3' }));

    expect(fixture.nativeElement.querySelector('.track-title').textContent.trim()).toBe('untitled.mp3');
  });

  it('does not render a cover image without metadata or a cover URL', () => {
    renderMetadata();
    expect(fixture.nativeElement.querySelector('.cover-img')).toBeFalsy();

    renderMetadata(createTrackMetadata({ coverUrl: { thumbUrl: '', originalUrl: '' } }));
    expect(fixture.nativeElement.querySelector('.cover-img')).toBeFalsy();
  });

  it('uses the muted cover color for the active theme', () => {
    renderMetadata(createTrackMetadata());
    const cover = fixture.nativeElement.querySelector('.cover-img');
    expect(cover.style.backgroundColor).toBe('rgb(153, 153, 153)');

    darkMode.set(true);
    fixture.detectChanges();
    expect(cover.style.backgroundColor).toBe('rgb(51, 51, 51)');
  });
});
