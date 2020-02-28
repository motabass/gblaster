import { async, TestBed } from '@angular/core/testing';
import { GamepadModule } from './gamepad.module';

describe('GamepadModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GamepadModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GamepadModule).toBeDefined();
  });
});
