import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Outfit, OutfitCanvasItem, UserPreferences, ScenePreference, SceneType, ClothingItem } from '@/types';
import { generateId } from '@/utils/image';

interface OutfitState {
  outfits: Outfit[];
  userPreferences: UserPreferences;

  addOutfit: (outfit: Omit<Outfit, 'id' | 'createdAt'>, canvasItems?: OutfitCanvasItem[]) => void;
  removeOutfit: (id: string) => void;

  recordPreference: (scene: SceneType, items: ClothingItem[]) => void;
  getScenePreference: (scene: SceneType) => ScenePreference | undefined;
}

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set, get) => ({
      outfits: [],
      userPreferences: {
        scenePreferences: [],
        totalFeedbacks: 0,
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
      name: 'outfit-storage',
      partialize: (state) => ({
        outfits: state.outfits,
        userPreferences: state.userPreferences,
      }),
    }
  )
);
