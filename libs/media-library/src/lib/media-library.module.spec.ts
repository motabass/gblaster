import { async, TestBed } from '@angular/core/testing';
import { MediaLibraryModule } from './media-library.module';

describe('MediaLibraryModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MediaLibraryModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MediaLibraryModule).toBeDefined();
  });
});
