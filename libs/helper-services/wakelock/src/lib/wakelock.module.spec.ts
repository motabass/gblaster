import { async, TestBed } from '@angular/core/testing';
import { WakelockModule } from './wakelock.module';

describe('WakelockModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [WakelockModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(WakelockModule).toBeDefined();
  });
});
