import { useCallback } from 'react';
import { SceneType, ClothingItem } from '@/types';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useOutfitStore } from '@/store/useOutfitStore';
import { getRandomOutfitForScene } from '@/services/outfitRecommendationService';

export const useOutfitRecommendation = () => {
  const clothingItems = useWardrobeStore((state) => state.clothingItems);
  const getScenePreference = useOutfitStore((state) => state.getScenePreference);

  const getRandomOutfit = useCallback((scene: SceneType): ClothingItem[] => {
    const scenePref = getScenePreference(scene);
    return getRandomOutfitForScene({ scene, clothingItems, scenePref });
  }, [clothingItems, getScenePreference]);

  return {
    getRandomOutfitForScene: getRandomOutfit,
  };
};
