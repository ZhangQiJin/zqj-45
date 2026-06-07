import { ClothingItem, SceneType, ClothingCategory, ScenePreference } from '@/types';
import { sceneRecommendations } from '@/data/scenes';

interface GetWeightedRandomItemParams {
  category: ClothingCategory;
  selectedItems: ClothingItem[];
  clothingItems: ClothingItem[];
  scenePref?: ScenePreference;
}

const getWeightedRandomItem = ({
  category,
  selectedItems,
  clothingItems,
  scenePref,
}: GetWeightedRandomItemParams): ClothingItem | null => {
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

interface GenerateCandidateOutfitsParams {
  suggestedCategories: ClothingCategory[];
  clothingItems: ClothingItem[];
  scenePref?: ScenePreference;
}

const generateCandidateOutfits = ({
  suggestedCategories,
  clothingItems,
  scenePref,
}: GenerateCandidateOutfitsParams): ClothingItem[][] => {
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
      const dress = getWeightedRandomItem({ category: 'dress', selectedItems: result, clothingItems, scenePref });
      if (dress) {
        result.push(dress);
        usedCategories.add('dress');
      }
    }

    if (!usedCategories.has('dress')) {
      if (suggestedCategories.includes('top')) {
        const top = getWeightedRandomItem({ category: 'top', selectedItems: result, clothingItems, scenePref });
        if (top) {
          result.push(top);
          usedCategories.add('top');
        }
      }
      if (suggestedCategories.includes('bottom')) {
        const bottom = getWeightedRandomItem({ category: 'bottom', selectedItems: result, clothingItems, scenePref });
        if (bottom) {
          result.push(bottom);
          usedCategories.add('bottom');
        }
      }
    }

    if (suggestedCategories.includes('outerwear')) {
      const outerwear = getWeightedRandomItem({ category: 'outerwear', selectedItems: result, clothingItems, scenePref });
      if (outerwear) {
        result.push(outerwear);
        usedCategories.add('outerwear');
      }
    }

    if (suggestedCategories.includes('shoes')) {
      const shoe = getWeightedRandomItem({ category: 'shoes', selectedItems: result, clothingItems, scenePref });
      if (shoe) {
        result.push(shoe);
        usedCategories.add('shoes');
      }
    }

    const accessoryProbability = scenePref ? 0.85 : 0.8;
    if (suggestedCategories.includes('accessory') && Math.random() < accessoryProbability) {
      const accessory = getWeightedRandomItem({ category: 'accessory', selectedItems: result, clothingItems, scenePref });
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

interface ScoreCandidatesParams {
  candidates: ClothingItem[][];
  scenePref?: ScenePreference;
}

const scoreCandidates = ({ candidates, scenePref }: ScoreCandidatesParams): number[] => {
  return candidates.map((candidate) => {
    let score = 0;
    const categories = candidate.map((i) => i.category).sort();

    if (scenePref) {
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
    }

    return score;
  });
};

interface SelectBestCandidateParams {
  candidates: ClothingItem[][];
  scores: number[];
}

const selectBestCandidate = ({ candidates, scores }: SelectBestCandidateParams): ClothingItem[] => {
  const maxScore = Math.max(...scores);
  if (maxScore === 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const weights = scores.map((s) => s + 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return candidates[i];
    }
  }

  return candidates[candidates.length - 1];
};

interface GetRandomOutfitForSceneParams {
  scene: SceneType;
  clothingItems: ClothingItem[];
  scenePref?: ScenePreference;
}

export const getRandomOutfitForScene = ({
  scene,
  clothingItems,
  scenePref,
}: GetRandomOutfitForSceneParams): ClothingItem[] => {
  const sceneData = sceneRecommendations.find((s) => s.scene === scene);
  const suggestedCategories = (sceneData?.suggestedCategories as ClothingCategory[]) || [
    'top',
    'bottom',
    'shoes',
  ];

  const candidates = generateCandidateOutfits({
    suggestedCategories,
    clothingItems,
    scenePref,
  });

  if (candidates.length === 0) return [];

  if (!scenePref || scenePref.categoryPreferences.length === 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const scores = scoreCandidates({ candidates, scenePref });
  return selectBestCandidate({ candidates, scores });
};
