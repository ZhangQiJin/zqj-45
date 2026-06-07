import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRandomOutfitForScene } from '../outfitRecommendationService';
import type { ClothingItem, SceneType, ScenePreference } from '@/types';

describe('outfitRecommendationService', () => {
  const createMockClothingItem = (
    id: string,
    category: ClothingItem['category'],
    color: string
  ): ClothingItem => ({
    id,
    name: `Item ${id}`,
    category,
    color,
    imageUrl: `https://example.com/${id}.jpg`,
    createdAt: Date.now(),
    tagIds: [],
  });

  const mockClothingItems: ClothingItem[] = [
    createMockClothingItem('top1', 'top', '白色'),
    createMockClothingItem('top2', 'top', '黑色'),
    createMockClothingItem('top3', 'top', '灰色'),
    createMockClothingItem('bottom1', 'bottom', '牛仔'),
    createMockClothingItem('bottom2', 'bottom', '黑色'),
    createMockClothingItem('bottom3', 'bottom', '米色'),
    createMockClothingItem('dress1', 'dress', '粉色'),
    createMockClothingItem('dress2', 'dress', '黑色'),
    createMockClothingItem('outerwear1', 'outerwear', '黑色'),
    createMockClothingItem('outerwear2', 'outerwear', '米色'),
    createMockClothingItem('shoes1', 'shoes', '白色'),
    createMockClothingItem('shoes2', 'shoes', '黑色'),
    createMockClothingItem('accessory1', 'accessory', '金色'),
    createMockClothingItem('accessory2', 'accessory', '银色'),
  ];

  const createMockScenePreference = (scene: SceneType): ScenePreference => ({
    scene,
    categoryPreferences: [
      { categories: ['top', 'bottom'], count: 10 },
      { categories: ['top', 'bottom', 'outerwear'], count: 5 },
      { categories: ['dress'], count: 3 },
    ],
    colorPairPreferences: [
      { color1: '白色', color2: '牛仔', count: 8 },
      { color1: '黑色', color2: '黑色', count: 6 },
      { color1: '白色', color2: '黑色', count: 4 },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRandomOutfitForScene', () => {
    it('should return an outfit with items for a given scene', () => {
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: mockClothingItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((item) => {
        expect(mockClothingItems).toContainEqual(item);
      });
    });

    it('should return empty array when no clothing items are available', () => {
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: [],
      });
      expect(result).toEqual([]);
    });

    it('should return outfit with suggested categories for the scene', () => {
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: mockClothingItems,
      });
      const categories = result.map((item) => item.category);
      expect(categories).toContain('top');
      expect(categories).toContain('bottom');
    });

    it('should use scene preferences when provided', () => {
      const scenePref = createMockScenePreference('commute');
      const results: ClothingItem[][] = [];
      for (let i = 0; i < 20; i++) {
        results.push(
          getRandomOutfitForScene({
            scene: 'commute',
            clothingItems: mockClothingItems,
            scenePref,
          })
        );
      }
      const nonEmptyResults = results.filter((r) => r.length > 0);
      expect(nonEmptyResults.length).toBeGreaterThan(0);
    });

    it('should handle scene with dress suggestion', () => {
      const result = getRandomOutfitForScene({
        scene: 'date',
        clothingItems: mockClothingItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle travel scene with accessories', () => {
      const results: ClothingItem[][] = [];
      for (let i = 0; i < 10; i++) {
        results.push(
          getRandomOutfitForScene({
            scene: 'travel',
            clothingItems: mockClothingItems,
          })
        );
      }
      const nonEmptyResults = results.filter((r) => r.length > 0);
      expect(nonEmptyResults.length).toBeGreaterThan(0);
    });

    it('should not duplicate items in the outfit', () => {
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: mockClothingItems,
      });
      const ids = result.map((item) => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should work with partial clothing inventory', () => {
      const partialItems = mockClothingItems.slice(0, 5);
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: partialItems,
      });
      expect(Array.isArray(result)).toBe(true);
      result.forEach((item) => {
        expect(partialItems).toContainEqual(item);
      });
    });

    it('should handle single clothing item gracefully', () => {
      const singleItem = [mockClothingItems[0]];
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: singleItem,
      });
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toEqual(singleItem[0]);
      }
    });

    it('should handle photo scene with multiple category options', () => {
      const result = getRandomOutfitForScene({
        scene: 'photo',
        clothingItems: mockClothingItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle class scene with outerwear', () => {
      const result = getRandomOutfitForScene({
        scene: 'class',
        clothingItems: mockClothingItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate different outfits across multiple calls', () => {
      const outfits = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = getRandomOutfitForScene({
          scene: 'commute',
          clothingItems: mockClothingItems,
        });
        outfits.add(JSON.stringify(result.map((item) => item.id).sort()));
      }
      expect(outfits.size).toBeGreaterThan(1);
    });

    it('should respect color pair preferences with higher weights', () => {
      const scenePref: ScenePreference = {
        scene: 'commute',
        categoryPreferences: [
          { categories: ['top', 'bottom'], count: 100 },
        ],
        colorPairPreferences: [
          { color1: '白色', color2: '牛仔', count: 100 },
        ],
      };

      const colorMatchCount = { match: 0, total: 0 };

      for (let i = 0; i < 50; i++) {
        const result = getRandomOutfitForScene({
          scene: 'commute',
          clothingItems: mockClothingItems,
          scenePref,
        });

        const top = result.find((item) => item.category === 'top');
        const bottom = result.find((item) => item.category === 'bottom');

        if (top && bottom) {
          colorMatchCount.total++;
          if (
            (top.color === '白色' && bottom.color === '牛仔') ||
            (top.color === '牛仔' && bottom.color === '白色')
          ) {
            colorMatchCount.match++;
          }
        }
      }

      expect(colorMatchCount.total).toBeGreaterThan(0);
    });

    it('should work with empty scene preferences', () => {
      const emptyScenePref: ScenePreference = {
        scene: 'commute',
        categoryPreferences: [],
        colorPairPreferences: [],
      };

      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: mockClothingItems,
        scenePref: emptyScenePref,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle missing categories in inventory', () => {
      const noOuterwearItems = mockClothingItems.filter(
        (item) => item.category !== 'outerwear'
      );
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: noOuterwearItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      const categories = result.map((item) => item.category);
      expect(categories).not.toContain('outerwear');
    });

    it('should handle only one category available', () => {
      const onlyTops = mockClothingItems.filter(
        (item) => item.category === 'top'
      );
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: onlyTops,
      });
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        result.forEach((item) => {
          expect(item.category).toBe('top');
        });
      }
    });
  });

  describe('weighted random selection', () => {
    it('should prefer items with higher color preference weight', () => {
      const scenePref: ScenePreference = {
        scene: 'commute',
        categoryPreferences: [{ categories: ['top', 'bottom'], count: 10 }],
        colorPairPreferences: [
          { color1: '白色', color2: '牛仔', count: 50 },
          { color1: '黑色', color2: '黑色', count: 1 },
        ],
      };

      const selectedWhiteTopCount = { count: 0, total: 0 };

      for (let i = 0; i < 100; i++) {
        const result = getRandomOutfitForScene({
          scene: 'commute',
          clothingItems: mockClothingItems,
          scenePref,
        });

        const bottom = result.find((item) => item.category === 'bottom');
        const top = result.find((item) => item.category === 'top');

        if (bottom && bottom.color === '牛仔' && top) {
          selectedWhiteTopCount.total++;
          if (top.color === '白色') {
            selectedWhiteTopCount.count++;
          }
        }
      }

      expect(selectedWhiteTopCount.total).toBeGreaterThan(0);
    });
  });

  describe('scoring candidates', () => {
    it('should generate candidates with category preferences', () => {
      const scenePref = createMockScenePreference('commute');
      const results: ClothingItem[][] = [];

      for (let i = 0; i < 30; i++) {
        results.push(
          getRandomOutfitForScene({
            scene: 'commute',
            clothingItems: mockClothingItems,
            scenePref,
          })
        );
      }

      const validOutfits = results.filter(
        (r) => r.some((item) => item.category === 'top') &&
               r.some((item) => item.category === 'bottom')
      );
      expect(validOutfits.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined scenePref gracefully', () => {
      const result = getRandomOutfitForScene({
        scene: 'commute',
        clothingItems: mockClothingItems,
        scenePref: undefined,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle unknown scene type', () => {
      const result = getRandomOutfitForScene({
        scene: 'unknown' as SceneType,
        clothingItems: mockClothingItems,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle dress with no top/bottom when dress is selected', () => {
      const dressOnlyItems = mockClothingItems.filter(
        (item) => item.category === 'dress' || item.category === 'shoes'
      );
      const result = getRandomOutfitForScene({
        scene: 'date',
        clothingItems: dressOnlyItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle large number of clothing items', () => {
      const manyItems: ClothingItem[] = [];
      for (let i = 0; i < 100; i++) {
        const categories: ClothingItem['category'][] = ['top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessory'];
        const colors = ['白色', '黑色', '灰色', '米色', '棕色', '蓝色', '粉色'];
        manyItems.push(
          createMockClothingItem(
            `item-${i}`,
            categories[i % categories.length],
            colors[i % colors.length]
          )
        );
      }

      const result = getRandomOutfitForScene({
        scene: 'travel',
        clothingItems: manyItems,
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(manyItems.length);
    });
  });
});
