import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EqualizerShellComponent } from './equalizer-shell.component';

describe('EqualizerShellComponent', () => {
  let component: EqualizerShellComponent;
  let fixture: ComponentFixture<EqualizerShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EqualizerShellComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EqualizerShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
