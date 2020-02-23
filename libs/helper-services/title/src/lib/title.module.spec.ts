import { async, TestBed } from '@angular/core/testing';
import { TitleModule } from './title.module';

describe('TitleModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TitleModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TitleModule).toBeDefined();
  });
});
