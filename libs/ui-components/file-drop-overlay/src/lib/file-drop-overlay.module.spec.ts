import { async, TestBed } from '@angular/core/testing';
import { FileDropOverlayModule } from './file-drop-overlay.module';

describe('FileDropOverlayModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FileDropOverlayModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(FileDropOverlayModule).toBeDefined();
  });
});
