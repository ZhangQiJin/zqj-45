import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ClothingItem,
  Outfit,
  CanvasItem,
  SceneType,
  ClothingCategory,
  WearRecord,
  ClothingWearStats,
  Tag,
  DEFAULT_TAGS,
  TAG_RECOMMENDATIONS,
  UserTransform,
  TransformCategory,
  TransformExecution,
  OutfitCanvasItem,
  ExportData,
  UserPreferences,
  ScenePreference,
} from '@/types';
import { generateId } from '@/utils/image';
import { sceneRecommendations } from '@/data/scenes';
import { useWardrobeStore, migrateClothingItems } from './useWardrobeStore';
import { useCanvasStore } from './useCanvasStore';
import { useOutfitStore } from './useOutfitStore';
import { useTransformStore } from './useTransformStore';
import { getRandomOutfitForScene as getRandomOutfitForSceneService } from '@/services/outfitRecommendationService';
import { stateLogger } from '@/monitoring';

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
  userPreferences: UserPreferences;

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

  recordPreference: (scene: SceneType, items: ClothingItem[]) => void;
  getScenePreference: (scene: SceneType) => ScenePreference | undefined;
}

export const useStore = create<AppState>()(
  persist(
    stateLogger(
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
        useWardrobeStore.getState().addClothingItem(item);
        set({ clothingItems: useWardrobeStore.getState().clothingItems });
      },

      removeClothingItem: (id) => {
        useWardrobeStore.getState().removeClothingItem(id);
        useCanvasStore.getState().removeFromCanvas(id);
        set({
          clothingItems: useWardrobeStore.getState().clothingItems,
          currentCanvasItems: useCanvasStore.getState().currentCanvasItems,
          wearRecords: useWardrobeStore.getState().wearRecords,
        });
      },

      updateClothingItem: (id, updates) => {
        useWardrobeStore.getState().updateClothingItem(id, updates);
        set({ clothingItems: useWardrobeStore.getState().clothingItems });
      },

      addOutfit: (outfit, canvasItems) => {
        useOutfitStore.getState().addOutfit(outfit, canvasItems);
        set({ outfits: useOutfitStore.getState().outfits });
      },

      removeOutfit: (id) => {
        useOutfitStore.getState().removeOutfit(id);
        set({ outfits: useOutfitStore.getState().outfits });
      },

      updateCanvasItems: (items) => {
        useCanvasStore.getState().updateCanvasItems(items);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      addToCanvas: (clothingId, x, y) => {
        useCanvasStore.getState().addToCanvas(clothingId, x, y);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      removeFromCanvas: (clothingId) => {
        useCanvasStore.getState().removeFromCanvas(clothingId);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      clearCanvas: () => {
        useCanvasStore.getState().clearCanvas();
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      bringToFront: (clothingId) => {
        useCanvasStore.getState().bringToFront(clothingId);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      sendToBack: (clothingId) => {
        useCanvasStore.getState().sendToBack(clothingId);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      bringForward: (clothingId) => {
        useCanvasStore.getState().bringForward(clothingId);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      sendBackward: (clothingId) => {
        useCanvasStore.getState().sendBackward(clothingId);
        set({ currentCanvasItems: useCanvasStore.getState().currentCanvasItems });
      },

      getRandomOutfitForScene: (scene) => {
        const clothingItems = useWardrobeStore.getState().clothingItems;
        const scenePref = useOutfitStore.getState().getScenePreference(scene);
        return getRandomOutfitForSceneService({ scene, clothingItems, scenePref });
      },

      addWearRecord: (record) => {
        useWardrobeStore.getState().addWearRecord(record);
        set({ wearRecords: useWardrobeStore.getState().wearRecords });
      },

      updateWearRecord: (id, record) => {
        useWardrobeStore.getState().updateWearRecord(id, record);
        set({ wearRecords: useWardrobeStore.getState().wearRecords });
      },

      removeWearRecord: (id) => {
        useWardrobeStore.getState().removeWearRecord(id);
        set({ wearRecords: useWardrobeStore.getState().wearRecords });
      },

      getWearRecordsByDate: (date) => {
        return useWardrobeStore.getState().getWearRecordsByDate(date);
      },

      getWearRecordsByClothingId: (clothingId) => {
        return useWardrobeStore.getState().getWearRecordsByClothingId(clothingId);
      },

      getClothingWearStats: (clothingId) => {
        return useWardrobeStore.getState().getClothingWearStats(clothingId);
      },

      getAllClothingWearStats: () => {
        return useWardrobeStore.getState().getAllClothingWearStats();
      },

      addTag: (tag) => {
        useWardrobeStore.getState().addTag(tag);
        set({ tags: useWardrobeStore.getState().tags });
      },

      updateTag: (id, updates) => {
        useWardrobeStore.getState().updateTag(id, updates);
        set({ tags: useWardrobeStore.getState().tags });
      },

      removeTag: (id) => {
        useWardrobeStore.getState().removeTag(id);
        set({
          tags: useWardrobeStore.getState().tags,
          clothingItems: useWardrobeStore.getState().clothingItems,
        });
      },

      initializeDefaultTags: () => {
        useWardrobeStore.getState().initializeDefaultTags();
        set({ tags: useWardrobeStore.getState().tags });
      },

      addTagToClothing: (clothingId, tagId) => {
        useWardrobeStore.getState().addTagToClothing(clothingId, tagId);
        set({ clothingItems: useWardrobeStore.getState().clothingItems });
      },

      removeTagFromClothing: (clothingId, tagId) => {
        useWardrobeStore.getState().removeTagFromClothing(clothingId, tagId);
        set({ clothingItems: useWardrobeStore.getState().clothingItems });
      },

      getClothingTags: (clothingId) => {
        return useWardrobeStore.getState().getClothingTags(clothingId);
      },

      getRecommendedTags: (category, color) => {
        return useWardrobeStore.getState().getRecommendedTags(category, color);
      },

      addUserTransform: (transform) => {
        useTransformStore.getState().addUserTransform(transform);
        set({ userTransforms: useTransformStore.getState().userTransforms });
      },

      removeUserTransform: (id) => {
        useTransformStore.getState().removeUserTransform(id);
        set({
          userTransforms: useTransformStore.getState().userTransforms,
          likedTransformIds: useTransformStore.getState().likedTransformIds,
          favoritedTransformIds: useTransformStore.getState().favoritedTransformIds,
        });
      },

      toggleLikeTransform: (transformId) => {
        useTransformStore.getState().toggleLikeTransform(transformId);
        set({
          likedTransformIds: useTransformStore.getState().likedTransformIds,
          userTransforms: useTransformStore.getState().userTransforms,
        });
      },

      toggleFavoriteTransform: (transformId) => {
        useTransformStore.getState().toggleFavoriteTransform(transformId);
        set({
          favoritedTransformIds: useTransformStore.getState().favoritedTransformIds,
          userTransforms: useTransformStore.getState().userTransforms,
        });
      },

      isTransformLiked: (transformId) => {
        return useTransformStore.getState().isTransformLiked(transformId);
      },

      isTransformFavorited: (transformId) => {
        return useTransformStore.getState().isTransformFavorited(transformId);
      },

      getTransformLikes: (transformId) => {
        return useTransformStore.getState().getTransformLikes(transformId);
      },

      startTransformExecution: (transformId, totalSteps) => {
        useTransformStore.getState().startTransformExecution(transformId, totalSteps);
        set({ transformExecutions: useTransformStore.getState().transformExecutions });
      },

      updateStepProgress: (transformId, stepIndex, completed, note) => {
        useTransformStore.getState().updateStepProgress(transformId, stepIndex, completed, note);
        set({ transformExecutions: useTransformStore.getState().transformExecutions });
      },

      getTransformExecution: (transformId) => {
        return useTransformStore.getState().getTransformExecution(transformId);
      },

      getTransformProgress: (transformId) => {
        return useTransformStore.getState().getTransformProgress(transformId);
      },

      isTransformCompleted: (transformId) => {
        return useTransformStore.getState().isTransformCompleted(transformId);
      },

      removeTransformExecution: (transformId) => {
        useTransformStore.getState().removeTransformExecution(transformId);
        set({ transformExecutions: useTransformStore.getState().transformExecutions });
      },

      importData: (data) => {
        const wardrobeState = useWardrobeStore.getState();
        const outfitState = useOutfitStore.getState();

        const existingTagNames = new Set(wardrobeState.tags.map((t) => t.name));
        const newTags: Tag[] = data.tags
          .filter((tag) => !existingTagNames.has(tag.name))
          .map((tag) => ({
            ...tag,
            id: generateId(),
            createdAt: Date.now(),
          }));

        const tagNameToId = new Map<string, string>();
        newTags.forEach((tag) => tagNameToId.set(tag.name, tag.id));
        wardrobeState.tags.forEach((tag) => tagNameToId.set(tag.name, tag.id));

        const existingClothingIds = new Set(wardrobeState.clothingItems.map((c) => c.id));
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

        let mergedPreferences = outfitState.userPreferences;
        if (data.userPreferences) {
          const importedPrefs = data.userPreferences;
          const mergedScenePrefs = [...outfitState.userPreferences.scenePreferences];

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
            totalFeedbacks: outfitState.userPreferences.totalFeedbacks + importedPrefs.totalFeedbacks,
          };
        }

        const updatedTags = [...wardrobeState.tags, ...newTags];
        const updatedClothingItems = [...wardrobeState.clothingItems, ...newClothingItems];
        const updatedOutfits = [...outfitState.outfits, ...newOutfits];

        useWardrobeStore.setState({
          tags: updatedTags,
          clothingItems: updatedClothingItems,
          wearRecords: wardrobeState.wearRecords,
        });

        useOutfitStore.setState({
          outfits: updatedOutfits,
          userPreferences: mergedPreferences,
        });

        set({
          tags: updatedTags,
          clothingItems: updatedClothingItems,
          outfits: updatedOutfits,
          userPreferences: mergedPreferences,
        });
      },

      getScenePreference: (scene) => {
        return useOutfitStore.getState().getScenePreference(scene);
      },

      recordPreference: (scene, items) => {
        useOutfitStore.getState().recordPreference(scene, items);
        set({ userPreferences: useOutfitStore.getState().userPreferences });
      },
    }),
      { storeName: 'AppStore' }
    ),
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

          useWardrobeStore.setState({
            clothingItems: state.clothingItems,
            wearRecords: state.wearRecords,
            tags: state.tags,
          });

          useOutfitStore.setState({
            outfits: state.outfits,
            userPreferences: state.userPreferences,
          });

          useTransformStore.setState({
            userTransforms: state.userTransforms,
            likedTransformIds: state.likedTransformIds,
            favoritedTransformIds: state.favoritedTransformIds,
            transformExecutions: state.transformExecutions,
          });
        }
      },
    }
  )
);
