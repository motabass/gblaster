import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { LocalStorageService } from 'ngx-webstorage';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let originalStyle: string | null;
  const root = document.documentElement;

  beforeEach(() => {
    originalStyle = root.getAttribute('style');
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        {
          provide: LocalStorageService,
          useValue: { retrieve: (key: string) => (key === 'darkModePreference' ? false : null), store: () => undefined }
        },
        { provide: Meta, useValue: { updateTag: () => undefined } }
      ]
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    root.toggleAttribute('style', originalStyle !== null);
    if (originalStyle !== null) root.setAttribute('style', originalStyle);
  });

  it('updates primary text contrast when the source color changes', () => {
    service.setPrimaryColor('#ffffff');
    service.initializeTheme();
    expect(root.style.getPropertyValue('--theme-primary-50')).toBe('#ffffff');
    expect(root.style.getPropertyValue('--theme-primary-50-contrast')).toBe('#000000');

    service.setPrimaryColor('#000000');
    TestBed.tick();
    expect(root.style.getPropertyValue('--theme-primary-50')).toBe('#000000');
    expect(root.style.getPropertyValue('--theme-primary-50-contrast')).toBe('#ffffff');
  });

  it('keeps contrast tied to the primary shade across color schemes and accent changes', () => {
    service.setPrimaryColor('#eeeeee');
    service.setAccentColor('#000000');
    service.setDarkMode(true);
    service.initializeTheme();
    expect(root.style.getPropertyValue('--theme-primary-50-contrast')).toBe('#000000');

    service.setDarkMode(false);
    service.setAccentColor('#ffffff');
    TestBed.tick();
    expect(root.style.getPropertyValue('--theme-primary-50-contrast')).toBe('#000000');
  });
});
