import { TestBed } from '@angular/core/testing';

import { VisualsService } from './visuals.service';

describe('VisualsService', () => {
  let service: VisualsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
