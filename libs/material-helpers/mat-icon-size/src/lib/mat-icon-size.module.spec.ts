import { async, TestBed } from '@angular/core/testing';
import { MatIconSizeModule } from './mat-icon-size.module';

describe('MatIconSizeModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatIconSizeModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(MatIconSizeModule).toBeDefined();
  });
});
