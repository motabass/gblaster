import { async, TestBed } from '@angular/core/testing';
import { DialogsModule } from './dialogs.module';

describe('DialogsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DialogsModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DialogsModule).toBeDefined();
  });
});
