import { async, TestBed } from '@angular/core/testing';
import { ThemeModule } from './theme.module';

describe('ThemeModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ThemeModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ThemeModule).toBeDefined();
  });
});
