import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClothingItem, Outfit, CanvasItem, SceneType, ClothingCategory, WearRecord, ClothingWearStats, Tag, DEFAULT_TAGS, TAG_RECOMMENDATIONS, UserTransform, TransformCategory, TransformExecution, OutfitCanvasItem, ExportData, UserPreferences, ScenePreference } from '@/types';
import { generateId } from '@/utils/image';
import { sceneRecommendations } from '@/data/scenes';

interface AppState {
  clothingItems: ClothingItem[];
  outfits: Outfit[];
  currentCanvasItems: CanvasItem[];
  wearRecords: WearRecord[];
  tags: Tag[];
  userTransforms: UserTransform[];
  likedTransformIds: string[];
  favoritedTransformIds: string[];
  transformExecutions: TransformExecution[];
  
  addClothingItem: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'tagIds'> & { tagIds?: string[] }) => void;
  removeClothingItem: (id: string) => void;
  updateClothingItem: (id: string, updates: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>) => void;
  
  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>, canvasItems?: OutfitCanvasItem[]) => void;
  removeOutfit: (id: string) => void;
  
  updateCanvasItems: (items: CanvasItem[]) => void;
  addToCanvas: (clothingId: string, x: number, y: number) => void;
  removeFromCanvas: (clothingId: string) => void;
  clearCanvas: () => void;
  bringToFront: (clothingId: string) => void;
  sendToBack: (clothingId: string) => void;
  bringForward: (clothingId: string) => void;
  sendBackward: (clothingId: string) => void;
  
  getRandomOutfitForScene: (scene: SceneType) => ClothingItem[];
  
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

  addUserTransform: (transform: Omit<UserTransform, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'isFavorited' | 'isUserCreated'> & { category: TransformCategory }) => void;
  removeUserTransform: (id: string) => void;
  toggleLikeTransform: (transformId: string) => void;
  toggleFavoriteTransform: (transformId: string) => void;
  isTransformLiked: (transformId: string) => boolean;
  isTransformFavorited: (transformId: string) => boolean;
  getTransformLikes: (transformId: string) => number;

  startTransformExecution: (transformId: string, totalSteps: number) => void;
  updateStepProgress: (transformId: string, stepIndex: number, completed: boolean, note?: string) => void;
  getTransformExecution: (transformId: string) => TransformExecution | undefined;
  getTransformProgress: (transformId: string) => number;
  isTransformCompleted: (transformId: string) => boolean;
  removeTransformExecution: (transformId: string) => void;

  importData: (data: ExportData) => void;

  userPreferences: UserPreferences;
  recordPreference: (scene: SceneType, items: ClothingItem[]) => void;
  getScenePreference: (scene: SceneType) => ScenePreference | undefined;
}

const migrateClothingItems = (items: any[]): ClothingItem[] => {
  return items.map((item) => ({
    ...item,
    tagIds: Array.isArray(item.tagIds) ? item.tagIds : [],
  }));
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      clothingItems: [],
      outfits: [],
      currentCanvasItems: [],
      wearRecords: [],
      tags: [],
      userTransforms: [],
      likedTransformIds: [],
      favoritedTransformIds: [],
      transformExecutions: [],
      userPreferences: {
        scenePreferences: [],
        totalFeedbacks: 0,
      },

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
          currentCanvasItems: state.currentCanvasItems.filter(
            (item) => item.clothingId !== id
          ),
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

      addOutfit: (outfit, canvasItems) => {
        set((state) => ({
          outfits: [
            ...state.outfits,
            { ...outfit, id: generateId(), createdAt: Date.now(), canvasItems },
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

      getRandomOutfitForScene: (scene) => {
        const { clothingItems, getScenePreference } = get();
        const sceneData = sceneRecommendations.find((s) => s.scene === scene);
        const suggestedCategories = (sceneData?.suggestedCategories as ClothingCategory[]) || [
          'top',
          'bottom',
          'shoes',
        ];
        const scenePref = getScenePreference(scene);

        const getWeightedRandomItem = (
          category: ClothingCategory,
          selectedItems: ClothingItem[]
        ): ClothingItem | null => {
          const items = clothingItems.filter(
            (i) => i.category === category && !selectedItems.some((si) => si.id === i.id)
          );
          if (items.length === 0) return null;

          const selectedColors = selectedItems.map((i) => i.color);
          
          const weights = items.map((item) => {
            let weight = 1;
            
            if (scenePref && selectedColors.length > 0) {
              selectedColors.forEach((sc) => {
                const colorPair = scenePref.colorPairPreferences.find(
                  (cp) =>
                    (cp.color1 === sc && cp.color2 === item.color) ||
                    (cp.color1 === item.color && cp.color2 === sc)
                );
                if (colorPair) {
                  weight += colorPair.count * 0.5;
                }
              });
            }
            
            return weight;
          });

          const totalWeight = weights.reduce((sum, w) => sum + w, 0);
          let random = Math.random() * totalWeight;
          
          for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
              return items[i];
            }
          }
          
          return items[items.length - 1];
        };

        const generateCandidateOutfits = (): ClothingItem[][] => {
          const candidates: ClothingItem[][] = [];
          
          for (let attempt = 0; attempt < 5; attempt++) {
            const result: ClothingItem[] = [];
            const usedCategories = new Set<string>();

            const hasDressSuggested = suggestedCategories.includes('dress');
            const hasTopBottomSuggested =
              suggestedCategories.includes('top') && suggestedCategories.includes('bottom');

            let useDress = false;
            if (hasDressSuggested) {
              if (scenePref) {
                const dressCombos = scenePref.categoryPreferences.filter((cp) =>
                  cp.categories.includes('dress')
                );
                const topBottomCombos = scenePref.categoryPreferences.filter((cp) =>
                  cp.categories.includes('top') && cp.categories.includes('bottom')
                );
                const dressScore = dressCombos.reduce((sum, c) => sum + c.count, 0);
                const tbScore = topBottomCombos.reduce((sum, c) => sum + c.count, 0);
                const total = dressScore + tbScore + 1;
                useDress = Math.random() < (dressScore + 0.4) / total;
              } else {
                useDress = !hasTopBottomSuggested || Math.random() > 0.4;
              }
            }

            if (useDress) {
              const dress = getWeightedRandomItem('dress', result);
              if (dress) {
                result.push(dress);
                usedCategories.add('dress');
              }
            }

            if (!usedCategories.has('dress')) {
              if (suggestedCategories.includes('top')) {
                const top = getWeightedRandomItem('top', result);
                if (top) {
                  result.push(top);
                  usedCategories.add('top');
                }
              }
              if (suggestedCategories.includes('bottom')) {
                const bottom = getWeightedRandomItem('bottom', result);
                if (bottom) {
                  result.push(bottom);
                  usedCategories.add('bottom');
                }
              }
            }

            if (suggestedCategories.includes('outerwear')) {
              const outerwear = getWeightedRandomItem('outerwear', result);
              if (outerwear) {
                result.push(outerwear);
                usedCategories.add('outerwear');
              }
            }

            if (suggestedCategories.includes('shoes')) {
              const shoe = getWeightedRandomItem('shoes', result);
              if (shoe) {
                result.push(shoe);
                usedCategories.add('shoes');
              }
            }

            const accessoryProbability = scenePref ? 0.85 : 0.8;
            if (suggestedCategories.includes('accessory') && Math.random() < accessoryProbability) {
              const accessory = getWeightedRandomItem('accessory', result);
              if (accessory) {
                result.push(accessory);
                usedCategories.add('accessory');
              }
            }

            if (result.length > 0) {
              candidates.push(result);
            }
          }
          
          return candidates;
        };

        const candidates = generateCandidateOutfits();
        if (candidates.length === 0) return [];

        if (!scenePref || scenePref.categoryPreferences.length === 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }

        const candidateScores = candidates.map((candidate) => {
          let score = 0;
          const categories = candidate.map((i) => i.category).sort();
          
          scenePref.categoryPreferences.forEach((cp) => {
            const matchCount = cp.categories.filter((c) => categories.includes(c)).length;
            const totalCount = Math.max(cp.categories.length, categories.length);
            const similarity = matchCount / totalCount;
            score += similarity * cp.count * 2;
          });
          
          for (let i = 0; i < candidate.length; i++) {
            for (let j = i + 1; j < candidate.length; j++) {
              const colorPair = scenePref.colorPairPreferences.find(
                (cp) =>
                  (cp.color1 === candidate[i].color && cp.color2 === candidate[j].color) ||
                  (cp.color1 === candidate[j].color && cp.color2 === candidate[i].color)
              );
              if (colorPair) {
                score += colorPair.count;
              }
            }
          }
          
          return score;
        });

        const maxScore = Math.max(...candidateScores);
        if (maxScore === 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }

        const weights = candidateScores.map((s) => s + 1);
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < candidates.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            return candidates[i];
          }
        }

        return candidates[candidates.length - 1];
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

      addUserTransform: (transform) => {
        set((state) => ({
          userTransforms: [
            ...state.userTransforms,
            {
              ...transform,
              id: generateId(),
              createdAt: Date.now(),
              likes: 0,
              isLiked: false,
              isFavorited: false,
              isUserCreated: true,
            } as UserTransform,
          ],
        }));
      },

      removeUserTransform: (id) => {
        set((state) => ({
          userTransforms: state.userTransforms.filter((t) => t.id !== id),
          likedTransformIds: state.likedTransformIds.filter((tid) => tid !== id),
          favoritedTransformIds: state.favoritedTransformIds.filter((tid) => tid !== id),
        }));
      },

      toggleLikeTransform: (transformId) => {
        set((state) => {
          const isLiked = state.likedTransformIds.includes(transformId);
          const newLikedIds = isLiked
            ? state.likedTransformIds.filter((id) => id !== transformId)
            : [...state.likedTransformIds, transformId];

          const updatedTransforms = state.userTransforms.map((t) =>
            t.id === transformId
              ? { ...t, isLiked: !isLiked, likes: isLiked ? t.likes - 1 : t.likes + 1 }
              : t
          );

          return {
            likedTransformIds: newLikedIds,
            userTransforms: updatedTransforms,
          };
        });
      },

      toggleFavoriteTransform: (transformId) => {
        set((state) => {
          const isFavorited = state.favoritedTransformIds.includes(transformId);
          const newFavoritedIds = isFavorited
            ? state.favoritedTransformIds.filter((id) => id !== transformId)
            : [...state.favoritedTransformIds, transformId];

          const updatedTransforms = state.userTransforms.map((t) =>
            t.id === transformId
              ? { ...t, isFavorited: !isFavorited }
              : t
          );

          return {
            favoritedTransformIds: newFavoritedIds,
            userTransforms: updatedTransforms,
          };
        });
      },

      isTransformLiked: (transformId) => {
        return get().likedTransformIds.includes(transformId);
      },

      isTransformFavorited: (transformId) => {
        return get().favoritedTransformIds.includes(transformId);
      },

      getTransformLikes: (transformId) => {
        const transform = get().userTransforms.find((t) => t.id === transformId);
        return transform?.likes || 0;
      },

      startTransformExecution: (transformId, totalSteps) => {
        set((state) => {
          const existing = state.transformExecutions.find((e) => e.transformId === transformId);
          if (existing) return state;

          const stepProgress = Array.from({ length: totalSteps }, (_, i) => ({
            stepIndex: i,
            completed: false,
          }));

          return {
            transformExecutions: [
              ...state.transformExecutions,
              {
                transformId,
                stepProgress,
                startedAt: Date.now(),
              },
            ],
          };
        });
      },

      updateStepProgress: (transformId, stepIndex, completed, note) => {
        set((state) => {
          const updatedExecutions = state.transformExecutions.map((execution) => {
            if (execution.transformId !== transformId) return execution;

            const updatedStepProgress = execution.stepProgress.map((step) => {
              if (step.stepIndex !== stepIndex) return step;
              return {
                ...step,
                completed,
                note: note !== undefined ? note : step.note,
                completedAt: completed ? Date.now() : undefined,
              };
            });

            const allCompleted = updatedStepProgress.every((step) => step.completed);

            return {
              ...execution,
              stepProgress: updatedStepProgress,
              completedAt: allCompleted ? Date.now() : undefined,
            };
          });

          return { transformExecutions: updatedExecutions };
        });
      },

      getTransformExecution: (transformId) => {
        return get().transformExecutions.find((e) => e.transformId === transformId);
      },

      getTransformProgress: (transformId) => {
        const execution = get().transformExecutions.find((e) => e.transformId === transformId);
        if (!execution || execution.stepProgress.length === 0) return 0;
        const completedSteps = execution.stepProgress.filter((step) => step.completed).length;
        return (completedSteps / execution.stepProgress.length) * 100;
      },

      isTransformCompleted: (transformId) => {
        const execution = get().transformExecutions.find((e) => e.transformId === transformId);
        if (!execution) return false;
        return execution.stepProgress.every((step) => step.completed);
      },

      removeTransformExecution: (transformId) => {
        set((state) => ({
          transformExecutions: state.transformExecutions.filter((e) => e.transformId !== transformId),
        }));
      },

      importData: (data) => {
        set((state) => {
          const existingTagNames = new Set(state.tags.map((t) => t.name));
          const newTags: Tag[] = data.tags
            .filter((tag) => !existingTagNames.has(tag.name))
            .map((tag) => ({
              ...tag,
              id: generateId(),
              createdAt: Date.now(),
            }));

          const tagNameToId = new Map<string, string>();
          newTags.forEach((tag) => tagNameToId.set(tag.name, tag.id));
          state.tags.forEach((tag) => tagNameToId.set(tag.name, tag.id));

          const existingClothingIds = new Set(state.clothingItems.map((c) => c.id));
          const clothingIdMapping = new Map<string, string>();
          const newClothingItems: ClothingItem[] = data.clothingItems
            .filter((item) => !existingClothingIds.has(item.id))
            .map((item) => {
              const newId = generateId();
              clothingIdMapping.set(item.id, newId);

              const mappedTagIds = (item.tagIds || [])
                .map((oldTagId) => {
                  const oldTag = data.tags.find((t) => t.id === oldTagId);
                  if (oldTag && tagNameToId.has(oldTag.name)) {
                    return tagNameToId.get(oldTag.name)!;
                  }
                  return null;
                })
                .filter((id): id is string => id !== null);

              return {
                ...item,
                id: newId,
                tagIds: mappedTagIds,
                createdAt: Date.now(),
              };
            });

          const newOutfits: Outfit[] = data.outfits.map((outfit) => {
            const mappedItems = outfit.items
              .map((oldId) => {
                if (existingClothingIds.has(oldId)) return oldId;
                return clothingIdMapping.get(oldId) || null;
              })
              .filter((id): id is string => id !== null);

            let mappedCanvasItems: OutfitCanvasItem[] | undefined = undefined;
            if (outfit.canvasItems) {
              mappedCanvasItems = outfit.canvasItems
                .map((ci) => {
                  let newClothingId: string | null = null;
                  if (existingClothingIds.has(ci.clothingId)) {
                    newClothingId = ci.clothingId;
                  } else {
                    newClothingId = clothingIdMapping.get(ci.clothingId) || null;
                  }
                  if (!newClothingId) return null;
                  return { ...ci, clothingId: newClothingId };
                })
                .filter((ci): ci is OutfitCanvasItem => ci !== null);
            }

            return {
              ...outfit,
              id: generateId(),
              items: mappedItems,
              canvasItems: mappedCanvasItems,
              createdAt: Date.now(),
            };
          });

          let mergedPreferences = state.userPreferences;
          if (data.userPreferences) {
            const importedPrefs = data.userPreferences;
            const mergedScenePrefs = [...state.userPreferences.scenePreferences];
            
            importedPrefs.scenePreferences.forEach((importedScenePref) => {
              const existingIndex = mergedScenePrefs.findIndex(
                (sp) => sp.scene === importedScenePref.scene
              );
              
              if (existingIndex === -1) {
                mergedScenePrefs.push({ ...importedScenePref });
              } else {
                const existingPref = mergedScenePrefs[existingIndex];
                
                importedScenePref.categoryPreferences.forEach((importedCatPref) => {
                  const catIndex = existingPref.categoryPreferences.findIndex(
                    (cp) =>
                      cp.categories.length === importedCatPref.categories.length &&
                      cp.categories.every((c, idx) => c === importedCatPref.categories[idx])
                  );
                  if (catIndex === -1) {
                    existingPref.categoryPreferences.push({ ...importedCatPref });
                  } else {
                    existingPref.categoryPreferences[catIndex].count += importedCatPref.count;
                  }
                });
                
                importedScenePref.colorPairPreferences.forEach((importedColorPref) => {
                  const colorIndex = existingPref.colorPairPreferences.findIndex(
                    (cp) =>
                      (cp.color1 === importedColorPref.color1 && cp.color2 === importedColorPref.color2) ||
                      (cp.color1 === importedColorPref.color2 && cp.color2 === importedColorPref.color1)
                  );
                  if (colorIndex === -1) {
                    existingPref.colorPairPreferences.push({ ...importedColorPref });
                  } else {
                    existingPref.colorPairPreferences[colorIndex].count += importedColorPref.count;
                  }
                });
              }
            });
            
            mergedPreferences = {
              scenePreferences: mergedScenePrefs,
              totalFeedbacks: state.userPreferences.totalFeedbacks + importedPrefs.totalFeedbacks,
            };
          }

          return {
            tags: [...state.tags, ...newTags],
            clothingItems: [...state.clothingItems, ...newClothingItems],
            outfits: [...state.outfits, ...newOutfits],
            userPreferences: mergedPreferences,
          };
        });
      },

      getScenePreference: (scene) => {
        return get().userPreferences.scenePreferences.find((sp) => sp.scene === scene);
      },

      recordPreference: (scene, items) => {
        set((state) => {
          const categories = items.map((i) => i.category).sort();
          const colors = items.map((i) => i.color);
          const colorPairs: string[][] = [];
          for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
              const pair = [colors[i], colors[j]].sort();
              colorPairs.push(pair);
            }
          }

          const scenePrefIndex = state.userPreferences.scenePreferences.findIndex(
            (sp) => sp.scene === scene
          );

          let updatedScenePrefs = [...state.userPreferences.scenePreferences];

          if (scenePrefIndex === -1) {
            updatedScenePrefs.push({
              scene,
              categoryPreferences: [{ categories, count: 1 }],
              colorPairPreferences: colorPairs.map(([c1, c2]) => ({
                color1: c1,
                color2: c2,
                count: 1,
              })),
            });
          } else {
            const existingPref = updatedScenePrefs[scenePrefIndex];
            
            const catPrefIndex = existingPref.categoryPreferences.findIndex(
              (cp) =>
                cp.categories.length === categories.length &&
                cp.categories.every((c, idx) => c === categories[idx])
            );

            let updatedCatPrefs = [...existingPref.categoryPreferences];
            if (catPrefIndex === -1) {
              updatedCatPrefs.push({ categories, count: 1 });
            } else {
              updatedCatPrefs[catPrefIndex] = {
                ...updatedCatPrefs[catPrefIndex],
                count: updatedCatPrefs[catPrefIndex].count + 1,
              };
            }

            let updatedColorPrefs = [...existingPref.colorPairPreferences];
            colorPairs.forEach(([c1, c2]) => {
              const colorIndex = updatedColorPrefs.findIndex(
                (cp) =>
                  (cp.color1 === c1 && cp.color2 === c2) ||
                  (cp.color1 === c2 && cp.color2 === c1)
              );
              if (colorIndex === -1) {
                updatedColorPrefs.push({ color1: c1, color2: c2, count: 1 });
              } else {
                updatedColorPrefs[colorIndex] = {
                  ...updatedColorPrefs[colorIndex],
                  count: updatedColorPrefs[colorIndex].count + 1,
                };
              }
            });

            updatedScenePrefs[scenePrefIndex] = {
              ...existingPref,
              categoryPreferences: updatedCatPrefs,
              colorPairPreferences: updatedColorPrefs,
            };
          }

          return {
            userPreferences: {
              scenePreferences: updatedScenePrefs,
              totalFeedbacks: state.userPreferences.totalFeedbacks + 1,
            },
          };
        });
      },
    }),
    {
      name: 'wardrobe-storage',
      partialize: (state) => ({
        clothingItems: state.clothingItems,
        outfits: state.outfits,
        wearRecords: state.wearRecords,
        tags: state.tags,
        userTransforms: state.userTransforms,
        likedTransformIds: state.likedTransformIds,
        favoritedTransformIds: state.favoritedTransformIds,
        transformExecutions: state.transformExecutions,
        userPreferences: state.userPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.clothingItems) {
          state.clothingItems = migrateClothingItems(state.clothingItems as any[]);
        }
      },
    }
  )
);
