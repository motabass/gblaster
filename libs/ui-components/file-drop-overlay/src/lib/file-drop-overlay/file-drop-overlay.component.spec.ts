import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileDropOverlayComponent } from './file-drop-overlay.component';

// Mock DragEvent since it's not available in Node.js environment
interface MockDragEvent {
  type: string;
  preventDefault: ReturnType<typeof vi.fn>;
  stopPropagation: ReturnType<typeof vi.fn>;
  dataTransfer: {
    files: FileList;
    items: MockDataTransferItem[];
    types: string[];
    dropEffect: string;
  } | null;
}

interface MockDataTransferItem {
  kind?: string;
  getAsFileSystemHandle?: ReturnType<typeof vi.fn>;
}

function createMockDragEvent(
  type: string,
  options?: { files?: FileList; items?: MockDataTransferItem[] }
): MockDragEvent {
  // Default item without getAsFileSystemHandle to trigger fallback path
  const defaultItems: MockDataTransferItem[] = [{ kind: 'file' }];

  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: options
      ? {
          files: options.files ?? createFileList([]),
          items: options.items ?? defaultItems,
          types: ['Files'],
          dropEffect: 'none'
        }
      : null
  };
}

function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    }
  } as unknown as FileList;

  for (const [index, file] of files.entries()) {
    (fileList as unknown as Record<number, File>)[index] = file;
  }

  return fileList;
}

describe('FileDropOverlayComponent', () => {
  let component: FileDropOverlayComponent;
  let fixture: ComponentFixture<FileDropOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDropOverlayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FileDropOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('over()', () => {
    it('should prevent default and stop propagation', () => {
      const event = createMockDragEvent('dragover', { files: createFileList([]) });

      component['over'](event as unknown as DragEvent);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should set dropEffect to copy when files are present', () => {
      const event = createMockDragEvent('dragover', { files: createFileList([]) });

      component['over'](event as unknown as DragEvent);

      expect(event.dataTransfer?.dropEffect).toBe('copy');
    });

    it('should make host element visible', () => {
      const event = createMockDragEvent('dragover', { files: createFileList([]) });

      component['over'](event as unknown as DragEvent);

      expect(fixture.nativeElement.style.visibility).toBe('visible');
    });
  });

  describe('leave()', () => {
    it('should prevent default and stop propagation', () => {
      const event = createMockDragEvent('dragleave', { files: createFileList([]) });

      component['leave'](event as unknown as DragEvent);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should hide host element', () => {
      const event = createMockDragEvent('dragleave', { files: createFileList([]) });

      component['leave'](event as unknown as DragEvent);

      expect(fixture.nativeElement.style.visibility).toBe('hidden');
    });

    it('should keep the overlay visible while the pointer moves between nested targets', () => {
      component['over'](createMockDragEvent('dragenter', { files: createFileList([]) }) as unknown as DragEvent);
      component['over'](createMockDragEvent('dragenter', { files: createFileList([]) }) as unknown as DragEvent);
      component['leave'](createMockDragEvent('dragleave', { files: createFileList([]) }) as unknown as DragEvent);

      expect(fixture.nativeElement.style.visibility).toBe('visible');

      component['leave'](createMockDragEvent('dragleave', { files: createFileList([]) }) as unknown as DragEvent);

      expect(fixture.nativeElement.style.visibility).toBe('hidden');
    });
  });

  describe('drop()', () => {
    it('should prevent default and stop propagation', () => {
      const event = createMockDragEvent('drop', { files: createFileList([]) });

      component['drop'](event as unknown as DragEvent);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should hide the overlay after drop', () => {
      const event = createMockDragEvent('drop', { files: createFileList([]) });

      component['drop'](event as unknown as DragEvent);

      expect(fixture.nativeElement.style.visibility).toBe('hidden');
    });

    it('should emit filesDroped with allowed files', () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);

      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' });
      fixture.componentRef.setInput('allowedTypes', ['audio/mpeg']);
      const event = createMockDragEvent('drop', { files: createFileList([mockFile]) });

      component['drop'](event as unknown as DragEvent);

      expect(filesDropedSpy).toHaveBeenCalledWith([mockFile]);
    });

    it('should filter out files with non-allowed types', () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);

      const allowedFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' });
      const notAllowedFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      fixture.componentRef.setInput('allowedTypes', ['audio/mpeg']);
      const event = createMockDragEvent('drop', {
        files: createFileList([allowedFile, notAllowedFile])
      });

      component['drop'](event as unknown as DragEvent);

      expect(filesDropedSpy).toHaveBeenCalledWith([allowedFile]);
    });

    it('should emit empty array when no files match allowed types', () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);

      const notAllowedFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      fixture.componentRef.setInput('allowedTypes', ['audio/mpeg']);
      const event = createMockDragEvent('drop', { files: createFileList([notAllowedFile]) });

      component['drop'](event as unknown as DragEvent);

      expect(filesDropedSpy).toHaveBeenCalledWith([]);
    });

    it('should emit fileHandlesDropped when File System Access API is available', async () => {
      const fileHandlesDroppedSpy = vi.fn();
      component.fileHandlesDropped.subscribe(fileHandlesDroppedSpy);

      const mockFileHandle = {
        kind: 'file',
        getFile: vi.fn().mockResolvedValue(new File(['content'], 'test.mp3', { type: 'audio/mpeg' }))
      } as unknown as FileSystemFileHandle;
      const mockItem: MockDataTransferItem = {
        kind: 'file',
        getAsFileSystemHandle: vi.fn().mockResolvedValue(mockFileHandle)
      };
      const event = createMockDragEvent('drop', { items: [mockItem], files: createFileList([]) });

      component['drop'](event as unknown as DragEvent);

      await vi.waitFor(() => {
        expect(fileHandlesDroppedSpy).toHaveBeenCalledWith([mockFileHandle]);
      });
    });

    it('should filter file handles by the allowed MIME types', async () => {
      const fileHandlesDroppedSpy = vi.fn();
      component.fileHandlesDropped.subscribe(fileHandlesDroppedSpy);
      fixture.componentRef.setInput('allowedTypes', ['audio/*']);

      const acceptedHandle = {
        kind: 'file',
        getFile: vi.fn().mockResolvedValue(new File(['audio'], 'test.mp3', { type: 'audio/mpeg' }))
      } as unknown as FileSystemFileHandle;
      const rejectedHandle = {
        kind: 'file',
        getFile: vi.fn().mockResolvedValue(new File(['text'], 'test.txt', { type: 'text/plain' }))
      } as unknown as FileSystemFileHandle;
      const event = createMockDragEvent('drop', {
        items: [
          { kind: 'file', getAsFileSystemHandle: vi.fn().mockResolvedValue(acceptedHandle) },
          { kind: 'file', getAsFileSystemHandle: vi.fn().mockResolvedValue(rejectedHandle) }
        ],
        files: createFileList([])
      });

      component['drop'](event as unknown as DragEvent);

      await vi.waitFor(() => {
        expect(fileHandlesDroppedSpy).toHaveBeenCalledWith([acceptedHandle]);
      });
    });

    it('should safely fall back when the drag has no items', () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);
      const event = createMockDragEvent('drop', { items: [], files: createFileList([]) });

      expect(() => component['drop'](event as unknown as DragEvent)).not.toThrow();
      expect(filesDropedSpy).toHaveBeenCalledWith([]);
    });

    it('should fall back to files when file handles are not available', () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);

      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' });
      fixture.componentRef.setInput('allowedTypes', ['audio/mpeg']);
      const event = createMockDragEvent('drop', { files: createFileList([mockFile]) });

      component['drop'](event as unknown as DragEvent);

      expect(filesDropedSpy).toHaveBeenCalledWith([mockFile]);
    });

    it('should fall back to files when File System Access API fails', async () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);

      const mockFile = new File(['content'], 'test.mp3', { type: 'audio/mpeg' });
      fixture.componentRef.setInput('allowedTypes', ['audio/mpeg']);

      const mockItem: MockDataTransferItem = {
        getAsFileSystemHandle: vi.fn().mockRejectedValue(new Error('API failed'))
      };
      const event = createMockDragEvent('drop', {
        items: [mockItem],
        files: createFileList([mockFile])
      });

      component['drop'](event as unknown as DragEvent);

      await vi.waitFor(() => {
        expect(filesDropedSpy).toHaveBeenCalledWith([mockFile]);
      });
    });
  });

  describe('allowedTypes input', () => {
    it('should have default value of ["*/*"]', () => {
      expect(component.allowedTypes()).toEqual(['*/*']);
    });

    it('should accept custom allowed types', () => {
      fixture.componentRef.setInput('allowedTypes', ['audio/mpeg', 'audio/wav']);

      expect(component.allowedTypes()).toEqual(['audio/mpeg', 'audio/wav']);
    });

    it('should accept files matching the default wildcard', () => {
      const filesDropedSpy = vi.fn();
      component.filesDropped.subscribe(filesDropedSpy);
      const file = new File(['content'], 'test.mp3', { type: 'audio/mpeg' });
      const event = createMockDragEvent('drop', { files: createFileList([file]) });

      component['drop'](event as unknown as DragEvent);

      expect(filesDropedSpy).toHaveBeenCalledWith([file]);
    });

    it('should ignore non-file drag events', () => {
      const event = createMockDragEvent('dragover', { files: createFileList([]), items: [] });
      const dataTransfer = event.dataTransfer;
      if (dataTransfer) {
        dataTransfer.types = ['text/plain'];
      }

      component['over'](event as unknown as DragEvent);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(fixture.nativeElement.style.visibility).toBe('');
    });
  });

  describe('template rendering', () => {
    it('should display drop instruction text', () => {
      const heading = fixture.nativeElement.querySelector('h2');
      expect(heading.textContent).toContain('Drop Music-Files here...');
    });
  });
});
