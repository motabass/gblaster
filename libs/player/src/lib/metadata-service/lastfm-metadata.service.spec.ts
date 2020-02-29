import { TestBed } from '@angular/core/testing';

import { LastfmMetadataService } from './lastfm-metadata.service';

describe('LastfmMetadataService', () => {
  let service: LastfmMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastfmMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
