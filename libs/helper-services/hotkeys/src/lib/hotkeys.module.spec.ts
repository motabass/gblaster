import { async, TestBed } from '@angular/core/testing';
import { HotkeysModule } from './hotkeys.module';

describe('HotkeysModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HotkeysModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(HotkeysModule).toBeDefined();
  });
});
