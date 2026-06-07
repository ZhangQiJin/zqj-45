import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClothingItem, Outfit, CanvasItem, SceneType } from '@/types';
import { generateId } from '@/utils/image';

interface AppState {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  currentCanvasItems: CanvasItem[];
  
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => void;
  removeClothingItem: (id: string) => void;
  
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
  removeOutfit: (id: string) => void;
  
  updateCanvasItems: (items: CanvasItem[]) => void;
  addToCanvas: (clothingId: string, x: number, y: number) => void;
  removeFromCanvas: (clothingId: string) => void;
  clearCanvas: () => void;
  
  getRandomOutfitForScene: (scene: SceneType) => ClothingItem[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clothingItems: [],
      outfits: [],
      currentCanvasItems: [],

      addClothingItem: (item) => {
        set((state) => ({
          clothingItems: [
            ...state.clothingItems,
            { ...item, id: generateId(), createdAt: Date.now() },
          ],
        }));
      },

      removeClothingItem: (id) => {
        set((state) => ({
          clothingItems: state.clothingItems.filter((item) => item.id !== id),
          currentCanvasItems: state.currentCanvasItems.filter(
            (item) => item.clothingId !== id
          ),
        }));
      },

      addOutfit: (outfit) => {
        set((state) => ({
          outfits: [
            ...state.outfits,
            { ...outfit, id: generateId(), createdAt: Date.now() },
          ],
        }));
      },

      removeOutfit: (id) => {
        set((state) => ({
          outfits: state.outfits.filter((o) => o.id !== id),
        }));
      },

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
          return {
            currentCanvasItems: [
              ...state.currentCanvasItems,
              { clothingId, x, y, width: 120, height: 160 },
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

      getRandomOutfitForScene: (scene) => {
        const { clothingItems } = get();
        const tops = clothingItems.filter((i) => i.category === 'top');
        const bottoms = clothingItems.filter((i) => i.category === 'bottom');
        const outerwears = clothingItems.filter((i) => i.category === 'outerwear');
        const dresses = clothingItems.filter((i) => i.category === 'dress');
        const shoes = clothingItems.filter((i) => i.category === 'shoes');
        const accessories = clothingItems.filter((i) => i.category === 'accessory');

        const result: ClothingItem[] = [];

        if (dresses.length > 0 && Math.random() > 0.5) {
          result.push(dresses[Math.floor(Math.random() * dresses.length)]);
        } else {
          if (tops.length > 0) {
            result.push(tops[Math.floor(Math.random() * tops.length)]);
          }
          if (bottoms.length > 0) {
            result.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
          }
        }

        if (scene === 'travel' || scene === 'commute') {
          if (outerwears.length > 0) {
            result.push(outerwears[Math.floor(Math.random() * outerwears.length)]);
          }
        }

        if (shoes.length > 0) {
          result.push(shoes[Math.floor(Math.random() * shoes.length)]);
        }

        if (accessories.length > 0 && Math.random() > 0.3) {
          result.push(accessories[Math.floor(Math.random() * accessories.length)]);
        }

        return result;
      },
    }),
    {
      name: 'wardrobe-storage',
      partialize: (state) => ({
        clothingItems: state.clothingItems,
        outfits: state.outfits,
      }),
    }
  )
);
