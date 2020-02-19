import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePromptDialogComponent } from './update-prompt-dialog.component';

describe('UpdatePromptComponent', () => {
  let component: UpdatePromptDialogComponent;
  let fixture: ComponentFixture<UpdatePromptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UpdatePromptDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
