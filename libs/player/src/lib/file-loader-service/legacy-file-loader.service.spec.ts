import { TestBed } from '@angular/core/testing';

import { LegacyFileLoaderService } from './legacy-file-loader.service';

describe('LegacyFileLoaderService', () => {
  let service: LegacyFileLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LegacyFileLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
