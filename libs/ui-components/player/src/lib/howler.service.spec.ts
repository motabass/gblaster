import { TestBed } from '@angular/core/testing';

import { HowlerService } from './howler.service';

describe('HowlerService', () => {
  let service: HowlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HowlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
