import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { SlidePanelComponent } from './slide-panel.component';

@Component({
  template: `
    <mtb-slide-panel
      [opened]="opened()"
      [bottom]="bottom()"
      [top]="top()"
      [width]="width()"
      [height]="height()"
      [side]="side()"
      [toggleIcon]="toggleIcon()"
      [buttonTooltip]="buttonTooltip()"
    >
      <p>Test Content</p>
    </mtb-slide-panel>
  `,
  imports: [SlidePanelComponent]
})
class TestHostComponent {
  readonly opened = signal(false);
  readonly bottom = signal<string | undefined>(undefined);
  readonly top = signal<string | undefined>(undefined);
  readonly width = signal('20rem');
  readonly height = signal('20rem');
  readonly side = signal<'left' | 'right'>('left');
  readonly toggleIcon = signal('');
  readonly buttonTooltip = signal<string | undefined>('');
}

describe('SlidePanelComponent', () => {
  let component: SlidePanelComponent;
  let fixture: ComponentFixture<SlidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlidePanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SlidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have isInitialized as false initially', () => {
      const newFixture = TestBed.createComponent(SlidePanelComponent);
      expect(newFixture.componentInstance.isInitialized()).toBe(false);
    });

    it('should have opened state as false by default', () => {
      expect(component.openedState()).toBe(false);
    });

    it('should have default width of 20rem', () => {
      expect(component.width()).toBe('20rem');
    });

    it('should have default height of 20rem', () => {
      expect(component.height()).toBe('20rem');
    });

    it('should have default side as left', () => {
      expect(component.side()).toBe('left');
    });

    it('should have empty toggleIcon by default', () => {
      expect(component.toggleIcon()).toBe('');
    });

    it('should have empty buttonTooltip by default', () => {
      expect(component.buttonTooltip()).toBe('');
    });
  });

  describe('openPanel()', () => {
    it('should set openedState to true', () => {
      expect(component.openedState()).toBe(false);

      component.openPanel();

      expect(component.openedState()).toBe(true);
    });
  });

  describe('closePanel()', () => {
    it('should set openedState to false', () => {
      component.openPanel();
      expect(component.openedState()).toBe(true);

      component.closePanel();

      expect(component.openedState()).toBe(false);
    });
  });

  describe('host bindings', () => {
    it('should apply closed-slide-panel class when panel is closed', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('closed-slide-panel')).toBe(true);
      expect(fixture.nativeElement.classList.contains('opened-slide-panel')).toBe(false);
    });

    it('should apply opened-slide-panel class when panel is opened', () => {
      component.openPanel();
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('opened-slide-panel')).toBe(true);
      expect(fixture.nativeElement.classList.contains('closed-slide-panel')).toBe(false);
    });

    it('should apply side class', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.classList.contains('left')).toBe(true);
    });
  });

  describe('toggle button', () => {
    it('should toggle panel state when button is clicked', () => {
      fixture.componentRef.setInput('toggleIcon', 'test-icon');
      fixture.detectChanges();

      const toggleButton = fixture.nativeElement.querySelector('.slide-panel-toggle');
      expect(toggleButton).toBeTruthy();

      expect(component.openedState()).toBe(false);

      toggleButton.click();
      fixture.detectChanges();

      expect(component.openedState()).toBe(true);

      toggleButton.click();
      fixture.detectChanges();

      expect(component.openedState()).toBe(false);
    });
  });
});

describe('SlidePanelComponent with TestHost', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let slidePanelElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    slidePanelElement = fixture.nativeElement.querySelector('mtb-slide-panel');
  });

  it('should create with host component', () => {
    expect(hostComponent).toBeTruthy();
    expect(slidePanelElement).toBeTruthy();
  });

  it('should project content', () => {
    const contentElement = slidePanelElement.querySelector('.panel-content p');
    expect(contentElement?.textContent).toBe('Test Content');
  });

  describe('input bindings', () => {
    it('should apply opened input', () => {
      expect(slidePanelElement.classList.contains('closed-slide-panel')).toBe(true);

      hostComponent.opened.set(true);
      fixture.detectChanges();

      expect(slidePanelElement.classList.contains('opened-slide-panel')).toBe(true);
    });

    it('should apply bottom style', () => {
      hostComponent.bottom.set('10px');
      fixture.detectChanges();

      expect(slidePanelElement.style.bottom).toBe('10px');
    });

    it('should apply top style', () => {
      hostComponent.top.set('20px');
      fixture.detectChanges();

      expect(slidePanelElement.style.top).toBe('20px');
    });

    it('should apply width style', () => {
      hostComponent.width.set('30rem');
      fixture.detectChanges();

      expect(slidePanelElement.style.width).toBe('30rem');
    });

    it('should apply height style', () => {
      hostComponent.height.set('40rem');
      fixture.detectChanges();

      expect(slidePanelElement.style.height).toBe('40rem');
    });

    it('should apply side class for left', () => {
      hostComponent.side.set('left');
      fixture.detectChanges();

      expect(slidePanelElement.classList.contains('left')).toBe(true);
    });

    it('should apply side class for right', () => {
      hostComponent.side.set('right');
      fixture.detectChanges();

      expect(slidePanelElement.classList.contains('right')).toBe(true);
      expect(slidePanelElement.classList.contains('left')).toBe(false);
    });
  });

  describe('linkedSignal behavior', () => {
    it('should sync openedState with opened input', () => {
      const slidePanelComponent = fixture.debugElement.query(
        (de) => de.componentInstance instanceof SlidePanelComponent
      ).componentInstance as SlidePanelComponent;

      expect(slidePanelComponent.openedState()).toBe(false);

      hostComponent.opened.set(true);
      fixture.detectChanges();

      expect(slidePanelComponent.openedState()).toBe(true);

      hostComponent.opened.set(false);
      fixture.detectChanges();

      expect(slidePanelComponent.openedState()).toBe(false);
    });

    it('should allow local state changes independent of input', () => {
      const slidePanelComponent = fixture.debugElement.query(
        (de) => de.componentInstance instanceof SlidePanelComponent
      ).componentInstance as SlidePanelComponent;

      expect(slidePanelComponent.openedState()).toBe(false);

      slidePanelComponent.openPanel();

      expect(slidePanelComponent.openedState()).toBe(true);
      expect(hostComponent.opened()).toBe(false);
    });
  });
});
