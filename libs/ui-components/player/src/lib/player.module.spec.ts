import { async, TestBed } from '@angular/core/testing';
import { PlayerModule } from './player.module';

describe('PlayerModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PlayerModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(PlayerModule).toBeDefined();
  });
});
