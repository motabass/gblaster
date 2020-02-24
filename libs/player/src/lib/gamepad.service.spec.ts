import { TestBed } from '@angular/core/testing';

import { GamepadService } from './gamepad.service';

describe('GamepadService', () => {
  let service: GamepadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamepadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
