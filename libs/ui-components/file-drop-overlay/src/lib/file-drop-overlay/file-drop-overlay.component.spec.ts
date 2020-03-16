import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDropOverlayComponent } from './file-drop-overlay.component';

describe('FileDropOverlayComponent', () => {
  let component: FileDropOverlayComponent;
  let fixture: ComponentFixture<FileDropOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileDropOverlayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDropOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
