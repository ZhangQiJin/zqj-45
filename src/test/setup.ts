import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: function (_type: string, _quality: number) {
    return 'data:image/jpeg;base64,mockDataURL';
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function (_contextType: string) {
    return {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: [] }),
      putImageData: vi.fn(),
      createImageData: vi.fn().mockReturnValue([]),
      setTransform: vi.fn(),
    };
  },
  writable: true,
  configurable: true,
});
