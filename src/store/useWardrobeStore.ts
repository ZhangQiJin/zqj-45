import { create } from 'zustand';
import { ClothingItem, WearRecord, ClothingWearStats, Tag, DEFAULT_TAGS, TAG_RECOMMENDATIONS, ClothingCategory } from '@/types';
import { generateId } from '@/utils/image';

interface WardrobeState {
  clothingItems: ClothingItem[];
  wearRecords: WearRecord[];
  tags: Tag[];

  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'tagIds'> & { tagIds?: string[] }) => void;
  removeClothingItem: (id: string) => void;
  updateClothingItem: (id: string, updates: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>) => void;

  addWearRecord: (record: Omit<WearRecord, 'id' | 'createdAt'>) => void;
  updateWearRecord: (id: string, record: Partial<Omit<WearRecord, 'id' | 'createdAt'>>) => void;
  removeWearRecord: (id: string) => void;
  getWearRecordsByDate: (date: string) => WearRecord | undefined;
  getWearRecordsByClothingId: (clothingId: string) => WearRecord[];
  getClothingWearStats: (clothingId: string) => ClothingWearStats;
  getAllClothingWearStats: () => Map<string, ClothingWearStats>;

  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => void;
  removeTag: (id: string) => void;
  initializeDefaultTags: () => void;

  addTagToClothing: (clothingId: string, tagId: string) => void;
  removeTagFromClothing: (clothingId: string, tagId: string) => void;
  getClothingTags: (clothingId: string) => Tag[];
  getRecommendedTags: (category: ClothingCategory, color: string) => Tag[];
}

export const migrateClothingItems = (items: any[]): ClothingItem[] => {
  return items.map((item) => ({
    ...item,
    tagIds: Array.isArray(item.tagIds) ? item.tagIds : [],
  }));
};

export const useWardrobeStore = create<WardrobeState>()((set, get) => ({
  clothingItems: [],
  wearRecords: [],
  tags: [],

  addClothingItem: (item) => {
    set((state) => ({
      clothingItems: [
        ...state.clothingItems,
        { ...item, tagIds: item.tagIds || [], id: generateId(), createdAt: Date.now() },
      ],
    }));
  },

  removeClothingItem: (id) => {
    set((state) => ({
      clothingItems: state.clothingItems.filter((item) => item.id !== id),
      wearRecords: state.wearRecords.map((record) => ({
        ...record,
        clothingIds: record.clothingIds.filter((cid) => cid !== id),
      })).filter((record) => record.clothingIds.length > 0),
    }));
  },

  updateClothingItem: (id, updates) => {
    set((state) => ({
      clothingItems: state.clothingItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
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

  addTag: (tag) => {
    set((state) => ({
      tags: [...state.tags, { ...tag, id: generateId(), createdAt: Date.now() }],
    }));
  },

  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    }));
  },

  removeTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      clothingItems: state.clothingItems.map((item) => ({
        ...item,
        tagIds: (item.tagIds || []).filter((tid) => tid !== id),
      })),
    }));
  },

  initializeDefaultTags: () => {
    const { tags } = get();
    if (tags.length > 0) return;

    DEFAULT_TAGS.forEach((tag) => {
      get().addTag(tag);
    });
  },

  addTagToClothing: (clothingId, tagId) => {
    set((state) => ({
      clothingItems: state.clothingItems.map((item) => {
        if (item.id !== clothingId) return item;
        const currentTagIds = item.tagIds || [];
        if (currentTagIds.includes(tagId)) return item;
        return { ...item, tagIds: [...currentTagIds, tagId] };
      }),
    }));
  },

  removeTagFromClothing: (clothingId, tagId) => {
    set((state) => ({
      clothingItems: state.clothingItems.map((item) =>
        item.id === clothingId
          ? { ...item, tagIds: (item.tagIds || []).filter((tid) => tid !== tagId) }
          : item
      ),
    }));
  },

  getClothingTags: (clothingId) => {
    const { clothingItems, tags } = get();
    const item = clothingItems.find((i) => i.id === clothingId);
    if (!item) return [];
    const itemTagIds = item.tagIds || [];
    return tags.filter((tag) => itemTagIds.includes(tag.id));
  },

  getRecommendedTags: (category, color) => {
    const { tags } = get();
    const key = `${category}-${color}`;
    const recommendedNames = TAG_RECOMMENDATIONS[key] || [];
    return tags.filter((tag) => recommendedNames.includes(tag.name));
  },
}));
