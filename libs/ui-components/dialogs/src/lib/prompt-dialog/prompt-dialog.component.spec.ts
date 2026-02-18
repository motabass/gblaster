import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptDialogComponent, PromptDialogData } from './prompt-dialog.component';

describe('PromptDialogComponent', () => {
  let component: PromptDialogComponent;
  let fixture: ComponentFixture<PromptDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockDialogData: PromptDialogData;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };

    mockDialogData = {
      title: 'Test Title',
      text: 'Test text content',
      buttonText: 'Confirm'
    };

    await TestBed.configureTestingModule({
      imports: [PromptDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('data injection', () => {
    it('should have dialog data injected', () => {
      expect(component.data).toBe(mockDialogData);
    });

    it('should have title from dialog data', () => {
      expect(component.data.title).toBe('Test Title');
    });

    it('should have text from dialog data', () => {
      expect(component.data.text).toBe('Test text content');
    });

    it('should have buttonText from dialog data', () => {
      expect(component.data.buttonText).toBe('Confirm');
    });
  });

  describe('update()', () => {
    it('should close the dialog with true', () => {
      component.update();

      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should close the dialog exactly once', () => {
      component.update();

      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel()', () => {
    it('should close the dialog with false', () => {
      component.cancel();

      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should close the dialog exactly once', () => {
      component.cancel();

      expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('template rendering', () => {
    it('should display the title in the dialog', () => {
      const titleElement = fixture.nativeElement.querySelector('[matDialogTitle]');
      expect(titleElement.textContent).toContain('Test Title');
    });

    it('should display the text content in the dialog', () => {
      const contentElement = fixture.nativeElement.querySelector('mat-dialog-content');
      expect(contentElement.textContent).toContain('Test text content');
    });

    it('should have an "Abbrechen" (cancel) button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const cancelButton = Array.from(buttons).find((btn) =>
        (btn as HTMLButtonElement).textContent?.includes('Abbrechen')
      );
      expect(cancelButton).toBeTruthy();
    });

    it('should have an "Update" button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const updateButton = Array.from(buttons).find((btn) =>
        (btn as HTMLButtonElement).textContent?.includes('Update')
      );
      expect(updateButton).toBeTruthy();
    });

    it('should call cancel() when "Abbrechen" button is clicked', () => {
      const cancelSpy = vi.spyOn(component, 'cancel');
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const cancelButton = Array.from(buttons).find((btn) =>
        (btn as HTMLButtonElement).textContent?.includes('Abbrechen')
      ) as HTMLButtonElement;

      cancelButton.click();

      expect(cancelSpy).toHaveBeenCalled();
    });

    it('should call update() when "Update" button is clicked', () => {
      const updateSpy = vi.spyOn(component, 'update');
      const buttons = fixture.nativeElement.querySelectorAll('button');
      const updateButton = Array.from(buttons).find((btn) =>
        (btn as HTMLButtonElement).textContent?.includes('Update')
      ) as HTMLButtonElement;

      updateButton.click();

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
