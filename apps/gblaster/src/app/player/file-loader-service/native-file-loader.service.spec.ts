import { TestBed } from '@angular/core/testing';

import { NativeBrowserFileLoaderService } from './native-browser-file-loader.service';

describe('NativeFileLoaderService', () => {
  let service: NativeBrowserFileLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeBrowserFileLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
