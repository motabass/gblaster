import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverDisplayComponent } from './cover-display.component';

describe('MetadataComponent', () => {
  let component: CoverDisplayComponent;
  let fixture: ComponentFixture<CoverDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoverDisplayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
