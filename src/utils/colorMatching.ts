import { ClothingItem } from '@/types';

export interface ColorMatchResult {
  item: ClothingItem;
  score: number;
  matchType: ColorMatchType;
  reason: string;
}

export type ColorMatchType = 'complementary' | 'analogous' | 'monochromatic' | 'triadic' | 'split-complementary' | 'neutral';

export interface ColorInfo {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
  isNeutral: boolean;
}

const COLOR_HUE_MAP: Record<string, { hue: number; saturation: number; lightness: number; isNeutral: boolean }> = {
  '白色': { hue: 0, saturation: 0, lightness: 100, isNeutral: true },
  '黑色': { hue: 0, saturation: 0, lightness: 0, isNeutral: true },
  '灰色': { hue: 0, saturation: 0, lightness: 50, isNeutral: true },
  '米色': { hue: 40, saturation: 10, lightness: 85, isNeutral: true },
  '棕色': { hue: 30, saturation: 40, lightness: 40, isNeutral: false },
  '红色': { hue: 0, saturation: 80, lightness: 50, isNeutral: false },
  '蓝色': { hue: 210, saturation: 80, lightness: 50, isNeutral: false },
  '绿色': { hue: 120, saturation: 70, lightness: 45, isNeutral: false },
  '黄色': { hue: 50, saturation: 90, lightness: 60, isNeutral: false },
  '粉色': { hue: 340, saturation: 60, lightness: 75, isNeutral: false },
  '紫色': { hue: 270, saturation: 70, lightness: 50, isNeutral: false },
  '牛仔': { hue: 210, saturation: 50, lightness: 45, isNeutral: false },
  '牛仔蓝': { hue: 210, saturation: 50, lightness: 45, isNeutral: false },
  '橙色': { hue: 30, saturation: 90, lightness: 55, isNeutral: false },
  '青色': { hue: 180, saturation: 70, lightness: 50, isNeutral: false },
};

const MATCH_TYPE_LABELS: Record<ColorMatchType, string> = {
  'complementary': '互补色搭配',
  'analogous': '邻近色搭配',
  'monochromatic': '同色系搭配',
  'triadic': '三角色搭配',
  'split-complementary': '分裂互补色搭配',
  'neutral': '中性色搭配',
};

export function getColorInfo(colorName: string): ColorInfo {
  const info = COLOR_HUE_MAP[colorName];
  if (info) {
    return { name: colorName, ...info };
  }
  return { name: colorName, hue: 0, saturation: 0, lightness: 50, isNeutral: true };
}

function normalizeHue(hue: number): number {
  let h = hue % 360;
  if (h < 0) h += 360;
  return h;
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

export function isComplementary(h1: number, h2: number): boolean {
  return hueDistance(h1, h2) >= 170 && hueDistance(h1, h2) <= 190;
}

export function isAnalogous(h1: number, h2: number): boolean {
  return hueDistance(h1, h2) <= 45;
}

export function isMonochromatic(h1: number, h2: number, s1: number, s2: number, l1: number, l2: number): boolean {
  return hueDistance(h1, h2) <= 20 && Math.abs(s1 - s2) <= 25 && Math.abs(l1 - l2) <= 35;
}

export function isTriadic(h1: number, h2: number): boolean {
  const d = hueDistance(h1, h2);
  return (d >= 110 && d <= 130) || (d >= 230 && d <= 250);
}

export function isSplitComplementary(h1: number, h2: number): boolean {
  const complement = normalizeHue(h1 + 180);
  const d = hueDistance(complement, h2);
  return d >= 20 && d <= 50;
}

export function calculateColorMatch(
  baseColor: ColorInfo,
  targetColor: ColorInfo
): { score: number; matchType: ColorMatchType; reason: string } {
  if (baseColor.isNeutral || targetColor.isNeutral) {
    if (baseColor.isNeutral && targetColor.isNeutral) {
      return {
        score: 85,
        matchType: 'neutral',
        reason: `${MATCH_TYPE_LABELS['neutral']}——${baseColor.name}与${targetColor.name}经典百搭`,
      };
    }
    return {
      score: 90,
      matchType: 'neutral',
      reason: `${MATCH_TYPE_LABELS['neutral']}——${baseColor.name}与${targetColor.name}和谐百搭`,
    };
  }

  if (isComplementary(baseColor.hue, targetColor.hue)) {
    return {
      score: 92,
      matchType: 'complementary',
      reason: `${MATCH_TYPE_LABELS['complementary']}——${baseColor.name}与${targetColor.name}强烈对比，视觉冲击`,
    };
  }

  if (isTriadic(baseColor.hue, targetColor.hue)) {
    return {
      score: 88,
      matchType: 'triadic',
      reason: `${MATCH_TYPE_LABELS['triadic']}——${baseColor.name}与${targetColor.name}色彩平衡，活力四射`,
    };
  }

  if (isSplitComplementary(baseColor.hue, targetColor.hue)) {
    return {
      score: 86,
      matchType: 'split-complementary',
      reason: `${MATCH_TYPE_LABELS['split-complementary']}——${baseColor.name}与${targetColor.name}对比柔和，层次丰富`,
    };
  }

  if (isAnalogous(baseColor.hue, targetColor.hue)) {
    return {
      score: 88,
      matchType: 'analogous',
      reason: `${MATCH_TYPE_LABELS['analogous']}——${baseColor.name}与${targetColor.name}和谐过渡，自然舒适`,
    };
  }

  if (isMonochromatic(baseColor.hue, targetColor.hue, baseColor.saturation, targetColor.saturation, baseColor.lightness, targetColor.lightness)) {
    return {
      score: 82,
      matchType: 'monochromatic',
      reason: `${MATCH_TYPE_LABELS['monochromatic']}——${baseColor.name}与${targetColor.name}深浅层次，高级质感`,
    };
  }

  const hueDiff = hueDistance(baseColor.hue, targetColor.hue);
  const baseScore = Math.max(50, 100 - Math.abs(hueDiff - 60) * 0.5);
  const adjustedScore = Math.round(baseScore * 0.7);

  return {
    score: adjustedScore,
    matchType: 'analogous',
    reason: `色彩搭配——${baseColor.name}与${targetColor.name}组合`,
  };
}

export function getColorRecommendations(
  baseItem: ClothingItem,
  allItems: ClothingItem[],
  excludeIds: string[] = []
): ColorMatchResult[] {
  const baseColor = getColorInfo(baseItem.color);

  const results: ColorMatchResult[] = [];

  for (const item of allItems) {
    if (item.id === baseItem.id || excludeIds.includes(item.id)) continue;

    const targetColor = getColorInfo(item.color);
    const match = calculateColorMatch(baseColor, targetColor);

    results.push({
      item,
      score: match.score,
      matchType: match.matchType,
      reason: match.reason,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-sage-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-earth-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100';
  if (score >= 80) return 'bg-sage-100';
  if (score >= 70) return 'bg-yellow-100';
  return 'bg-earth-100';
}
