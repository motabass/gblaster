import { async, TestBed } from '@angular/core/testing';
import { VisualsModule } from './visuals.module';

describe('VisualsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [VisualsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(VisualsModule).toBeDefined();
  });
});
