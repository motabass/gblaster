import { async, TestBed } from '@angular/core/testing';
import { SlidePanelModule } from './slide-panel.module';

describe('SlidePanelModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SlidePanelModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SlidePanelModule).toBeDefined();
  });
});
