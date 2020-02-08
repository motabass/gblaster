import { TestBed } from '@angular/core/testing';

import { NativeFileLoaderService } from './native-file-loader.service';

describe('NativeFileLoaderService', () => {
  let service: NativeFileLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeFileLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
