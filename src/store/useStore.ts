import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClothingItem, Outfit, CanvasItem, SceneType, ClothingCategory, WearRecord, ClothingWearStats } from '@/types';
import { generateId } from '@/utils/image';
import { sceneRecommendations } from '@/data/scenes';

interface AppState {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  currentCanvasItems: CanvasItem[];
  wearRecords: WearRecord[];
  
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt'>) => void;
  removeClothingItem: (id: string) => void;
  
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>) => void;
  removeOutfit: (id: string) => void;
  
  updateCanvasItems: (items: CanvasItem[]) => void;
  addToCanvas: (clothingId: string, x: number, y: number) => void;
  removeFromCanvas: (clothingId: string) => void;
  clearCanvas: () => void;
  
  getRandomOutfitForScene: (scene: SceneType) => ClothingItem[];
  
  addWearRecord: (record: Omit<WearRecord, 'id' | 'createdAt'>) => void;
  updateWearRecord: (id: string, record: Partial<Omit<WearRecord, 'id' | 'createdAt'>>) => void;
  removeWearRecord: (id: string) => void;
  getWearRecordsByDate: (date: string) => WearRecord | undefined;
  getWearRecordsByClothingId: (clothingId: string) => WearRecord[];
  getClothingWearStats: (clothingId: string) => ClothingWearStats;
  getAllClothingWearStats: () => Map<string, ClothingWearStats>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clothingItems: [],
      outfits: [],
      currentCanvasItems: [],
      wearRecords: [],

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
          wearRecords: state.wearRecords.map((record) => ({
            ...record,
            clothingIds: record.clothingIds.filter((cid) => cid !== id),
          })).filter((record) => record.clothingIds.length > 0),
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
        const sceneData = sceneRecommendations.find((s) => s.scene === scene);
        const suggestedCategories = (sceneData?.suggestedCategories as ClothingCategory[]) || [
          'top',
          'bottom',
          'shoes',
        ];

        const result: ClothingItem[] = [];
        const usedCategories = new Set<string>();

        const getRandomItem = (category: ClothingCategory): ClothingItem | null => {
          const items = clothingItems.filter(
            (i) => i.category === category && !result.includes(i)
          );
          if (items.length === 0) return null;
          return items[Math.floor(Math.random() * items.length)];
        };

        const hasDressSuggested = suggestedCategories.includes('dress');
        const hasTopBottomSuggested =
          suggestedCategories.includes('top') && suggestedCategories.includes('bottom');

        if (hasDressSuggested && (!hasTopBottomSuggested || Math.random() > 0.4)) {
          const dress = getRandomItem('dress');
          if (dress) {
            result.push(dress);
            usedCategories.add('dress');
          }
        }

        if (!usedCategories.has('dress')) {
          if (suggestedCategories.includes('top')) {
            const top = getRandomItem('top');
            if (top) {
              result.push(top);
              usedCategories.add('top');
            }
          }
          if (suggestedCategories.includes('bottom')) {
            const bottom = getRandomItem('bottom');
            if (bottom) {
              result.push(bottom);
              usedCategories.add('bottom');
            }
          }
        }

        if (suggestedCategories.includes('outerwear')) {
          const outerwear = getRandomItem('outerwear');
          if (outerwear) {
            result.push(outerwear);
            usedCategories.add('outerwear');
          }
        }

        if (suggestedCategories.includes('shoes')) {
          const shoe = getRandomItem('shoes');
          if (shoe) {
            result.push(shoe);
            usedCategories.add('shoes');
          }
        }

        if (suggestedCategories.includes('accessory') && Math.random() > 0.2) {
          const accessory = getRandomItem('accessory');
          if (accessory) {
            result.push(accessory);
            usedCategories.add('accessory');
          }
        }

        return result;
      },

      addWearRecord: (record) => {
        set((state) => {
          const existingIndex = state.wearRecords.findIndex((r) => r.date === record.date);
          if (existingIndex >= 0) {
            const updatedRecords = [...state.wearRecords];
            updatedRecords[existingIndex] = {
              ...updatedRecords[existingIndex],
              clothingIds: record.clothingIds,
              note: record.note,
            };
            return { wearRecords: updatedRecords };
          }
          return {
            wearRecords: [
              ...state.wearRecords,
              { ...record, id: generateId(), createdAt: Date.now() },
            ],
          };
        });
      },

      updateWearRecord: (id, record) => {
        set((state) => ({
          wearRecords: state.wearRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        }));
      },

      removeWearRecord: (id) => {
        set((state) => ({
          wearRecords: state.wearRecords.filter((r) => r.id !== id),
        }));
      },

      getWearRecordsByDate: (date) => {
        return get().wearRecords.find((r) => r.date === date);
      },

      getWearRecordsByClothingId: (clothingId) => {
        return get().wearRecords.filter((r) => r.clothingIds.includes(clothingId));
      },

      getClothingWearStats: (clothingId) => {
        const records = get().wearRecords.filter((r) => r.clothingIds.includes(clothingId));
        const wearDates = records.map((r) => r.date).sort();
        return {
          clothingId,
          totalWears: records.length,
          lastWornDate: wearDates.length > 0 ? wearDates[wearDates.length - 1] : null,
          wearDates,
        };
      },

      getAllClothingWearStats: () => {
        const stats = new Map<string, ClothingWearStats>();
        const { clothingItems, wearRecords } = get();
        
        clothingItems.forEach((item) => {
          stats.set(item.id, {
            clothingId: item.id,
            totalWears: 0,
            lastWornDate: null,
            wearDates: [],
          });
        });

        wearRecords.forEach((record) => {
          record.clothingIds.forEach((clothingId) => {
            const existing = stats.get(clothingId);
            if (existing) {
              existing.totalWears += 1;
              existing.wearDates.push(record.date);
              if (!existing.lastWornDate || record.date > existing.lastWornDate) {
                existing.lastWornDate = record.date;
              }
            }
          });
        });

        return stats;
      },
    }),
    {
      name: 'wardrobe-storage',
      partialize: (state) => ({
        clothingItems: state.clothingItems,
        outfits: state.outfits,
        wearRecords: state.wearRecords,
      }),
    }
  )
);
