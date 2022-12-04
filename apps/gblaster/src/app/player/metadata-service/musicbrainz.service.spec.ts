import { TestBed } from '@angular/core/testing';

import { MusicbrainzService } from './musicbrainz.service';

describe('MusicbrainzService', () => {
  let service: MusicbrainzService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicbrainzService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
