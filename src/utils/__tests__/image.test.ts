import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImage, generateId } from '../image';

describe('compressImage', () => {
  const createMockFile = (size: number = 1024, type: string = 'image/jpeg'): File => {
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < size; i++) {
      view[i] = Math.floor(Math.random() * 256);
    }
    return new File([buffer], 'test.jpg', { type });
  };

  const createMockFileReaderClass = (imgWidth: number, imgHeight: number, shouldError: boolean = false, imgShouldError: boolean = false) => {
    return class MockFileReader {
      result: string | ArrayBuffer | null = null;
      error: Error | null = null;
      readyState: number = 0;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
      onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

      readAsDataURL() {
        this.result = 'data:image/jpeg;base64,mockImageData';
        setTimeout(() => {
          if (shouldError) {
            this.error = new Error('File read error');
            if (this.onerror) {
              this.onerror(new Error('File read error') as unknown as ProgressEvent<FileReader>);
            }
          } else {
            const originalImage = window.Image;
            
            class MockImage {
              width: number = 0;
              height: number = 0;
              src: string = '';
              onload: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;
              onerror: ((this: GlobalEventHandlers, ev: Event) => any) | null = null;

              constructor() {
                setTimeout(() => {
                  this.width = imgWidth;
                  this.height = imgHeight;
                  if (imgShouldError) {
                    if (this.onerror) {
                      this.onerror(new Error('Image load error') as unknown as Event);
                    }
                  } else {
                    if (this.onload) {
                      this.onload({} as Event);
                    }
                  }
                }, 0);
              }
            }

            (window as any).Image = MockImage;
            
            if (this.onload) {
              this.onload({ target: { result: this.result } } as ProgressEvent<FileReader>);
            }
            
            (window as any).Image = originalImage;
          }
        }, 0);
      }

      abort() {}
    } as unknown as typeof FileReader;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should compress a normal image successfully', async () => {
    const MockFileReader = createMockFileReaderClass(800, 600);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();
    const result = await compressImage(file);
    expect(result).toBe('data:image/jpeg;base64,mockDataURL');
  });

  it('should resize oversized image proportionally when width exceeds maxWidth', async () => {
    const originalWidth = 1200;
    const originalHeight = 900;
    const maxWidth = 400;
    let canvasWidth: number | undefined;
    let canvasHeight: number | undefined;
    let drawImageWidth: number | undefined;
    let drawImageHeight: number | undefined;

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        const canvas = {
          get width() { return canvasWidth || 0; },
          set width(val) { canvasWidth = val; },
          get height() { return canvasHeight || 0; },
          set height(val) { canvasHeight = val; },
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn((_img, _x, _y, w, h) => {
              drawImageWidth = w;
              drawImageHeight = h;
            }),
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mockDataURL'),
        } as unknown as HTMLCanvasElement;
        return canvas;
      }
      return document.createElement(tag);
    });

    const MockFileReader = createMockFileReaderClass(originalWidth, originalHeight);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();
    await compressImage(file, maxWidth);

    expect(canvasWidth).toBe(maxWidth);
    expect(canvasHeight).toBe((originalHeight * maxWidth) / originalWidth);
    expect(drawImageWidth).toBe(maxWidth);
    expect(drawImageHeight).toBe((originalHeight * maxWidth) / originalWidth);

    createElementSpy.mockRestore();
  });

  it('should not resize image when width is within maxWidth', async () => {
    const originalWidth = 300;
    const originalHeight = 200;
    const maxWidth = 400;
    let canvasWidth: number | undefined;
    let canvasHeight: number | undefined;

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        const canvas = {
          get width() { return canvasWidth || 0; },
          set width(val) { canvasWidth = val; },
          get height() { return canvasHeight || 0; },
          set height(val) { canvasHeight = val; },
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn(),
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mockDataURL'),
        } as unknown as HTMLCanvasElement;
        return canvas;
      }
      return document.createElement(tag);
    });

    const MockFileReader = createMockFileReaderClass(originalWidth, originalHeight);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();
    await compressImage(file, maxWidth);

    expect(canvasWidth).toBe(originalWidth);
    expect(canvasHeight).toBe(originalHeight);

    createElementSpy.mockRestore();
  });

  it('should use custom quality parameter when provided', async () => {
    const customQuality = 0.5;
    let calledQuality: number | undefined;

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        const canvas = {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn(),
          }),
          toDataURL: vi.fn((_type, quality) => {
            calledQuality = quality;
            return 'data:image/jpeg;base64,mockDataURL';
          }),
        } as unknown as HTMLCanvasElement;
        return canvas;
      }
      return document.createElement(tag);
    });

    const MockFileReader = createMockFileReaderClass(800, 600);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();
    await compressImage(file, 400, customQuality);

    expect(calledQuality).toBe(customQuality);

    createElementSpy.mockRestore();
  });

  it('should reject with error when canvas context is not available', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        const canvas = {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue(null),
          toDataURL: vi.fn(),
        } as unknown as HTMLCanvasElement;
        return canvas;
      }
      return document.createElement(tag);
    });

    const MockFileReader = createMockFileReaderClass(800, 600);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();

    await expect(compressImage(file)).rejects.toThrow('Failed to get canvas context');

    createElementSpy.mockRestore();
  });

  it('should reject when FileReader encounters an error', async () => {
    const MockFileReader = createMockFileReaderClass(800, 600, true);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();
    await expect(compressImage(file)).rejects.toBeDefined();
  });

  it('should reject when image loading fails', async () => {
    const MockFileReader = createMockFileReaderClass(800, 600, false, true);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile();
    await expect(compressImage(file)).rejects.toBeDefined();
  });

  it('should handle very large image dimensions correctly', async () => {
    const originalWidth = 4096;
    const originalHeight = 2160;
    const maxWidth = 800;
    let canvasWidth: number | undefined;
    let canvasHeight: number | undefined;

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        const canvas = {
          get width() { return canvasWidth || 0; },
          set width(val) { canvasWidth = val; },
          get height() { return canvasHeight || 0; },
          set height(val) { canvasHeight = val; },
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn(),
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,mockDataURL'),
        } as unknown as HTMLCanvasElement;
        return canvas;
      }
      return document.createElement(tag);
    });

    const MockFileReader = createMockFileReaderClass(originalWidth, originalHeight);
    vi.stubGlobal('FileReader', MockFileReader);
    
    const file = createMockFile(1024 * 1024);
    await compressImage(file, maxWidth);

    expect(canvasWidth).toBe(maxWidth);
    expect(canvasHeight).toBeCloseTo((originalHeight * maxWidth) / originalWidth);

    createElementSpy.mockRestore();
  });
});

describe('generateId', () => {
  it('should generate a string id', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique ids on each call', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});
