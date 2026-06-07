import { create } from 'zustand';
import { CanvasItem } from '@/types';

interface CanvasState {
  currentCanvasItems: CanvasItem[];

  updateCanvasItems: (items: CanvasItem[]) => void;
  addToCanvas: (clothingId: string, x: number, y: number) => void;
  removeFromCanvas: (clothingId: string) => void;
  clearCanvas: () => void;
  bringToFront: (clothingId: string) => void;
  sendToBack: (clothingId: string) => void;
  bringForward: (clothingId: string) => void;
  sendBackward: (clothingId: string) => void;
}

export const useCanvasStore = create<CanvasState>()((set, get) => ({
  currentCanvasItems: [],

  updateCanvasItems: (items) => {
    set({ currentCanvasItems: items });
  },

  addToCanvas: (clothingId, x, y) => {
    set((state) => {
      const existing = state.currentCanvasItems.find(
        (item) => item.clothingId === clothingId
      );
      if (existing) {
        return {
          currentCanvasItems: state.currentCanvasItems.map((item) =>
            item.clothingId === clothingId ? { ...item, x, y } : item
          ),
        };
      }
      const maxZIndex = state.currentCanvasItems.length > 0
        ? Math.max(...state.currentCanvasItems.map((item) => item.zIndex))
        : 0;
      return {
        currentCanvasItems: [
          ...state.currentCanvasItems,
          { clothingId, x, y, width: 120, height: 160, zIndex: maxZIndex + 1 },
        ],
      };
    });
  },

  removeFromCanvas: (clothingId) => {
    set((state) => ({
      currentCanvasItems: state.currentCanvasItems.filter(
        (item) => item.clothingId !== clothingId
      ),
    }));
  },

  clearCanvas: () => {
    set({ currentCanvasItems: [] });
  },

  bringToFront: (clothingId) => {
    set((state) => {
      const maxZIndex = Math.max(...state.currentCanvasItems.map((item) => item.zIndex));
      return {
        currentCanvasItems: state.currentCanvasItems.map((item) =>
          item.clothingId === clothingId ? { ...item, zIndex: maxZIndex + 1 } : item
        ),
      };
    });
  },

  sendToBack: (clothingId) => {
    set((state) => {
      const minZIndex = Math.min(...state.currentCanvasItems.map((item) => item.zIndex));
      return {
        currentCanvasItems: state.currentCanvasItems.map((item) =>
          item.clothingId === clothingId ? { ...item, zIndex: minZIndex - 1 } : item
        ),
      };
    });
  },

  bringForward: (clothingId) => {
    set((state) => {
      const items = [...state.currentCanvasItems].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = items.findIndex((item) => item.clothingId === clothingId);
      if (currentIndex === -1 || currentIndex === items.length - 1) return state;

      const nextIndex = currentIndex + 1;
      const currentZIndex = items[currentIndex].zIndex;
      const nextZIndex = items[nextIndex].zIndex;

      return {
        currentCanvasItems: state.currentCanvasItems.map((item) => {
          if (item.clothingId === clothingId) return { ...item, zIndex: nextZIndex };
          if (item.clothingId === items[nextIndex].clothingId) return { ...item, zIndex: currentZIndex };
          return item;
        }),
      };
    });
  },

  sendBackward: (clothingId) => {
    set((state) => {
      const items = [...state.currentCanvasItems].sort((a, b) => a.zIndex - b.zIndex);
      const currentIndex = items.findIndex((item) => item.clothingId === clothingId);
      if (currentIndex <= 0) return state;

      const prevIndex = currentIndex - 1;
      const currentZIndex = items[currentIndex].zIndex;
      const prevZIndex = items[prevIndex].zIndex;

      return {
        currentCanvasItems: state.currentCanvasItems.map((item) => {
          if (item.clothingId === clothingId) return { ...item, zIndex: prevZIndex };
          if (item.clothingId === items[prevIndex].clothingId) return { ...item, zIndex: currentZIndex };
          return item;
        }),
      };
    });
  },
}));
