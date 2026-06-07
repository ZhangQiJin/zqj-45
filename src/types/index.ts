export type ClothingCategory = 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  imageUrl: string;
  createdAt: number;
}

export type TransformCategory = 'cut' | 'dye' | 'patchwork' | 'decorate';

export interface TransformTemplate {
  id: string;
  title: string;
  category: TransformCategory;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  steps: string[];
  beforeImage: string;
  afterImage: string;
}

export type SceneType = 'class' | 'commute' | 'travel' | 'photo' | 'date';

export interface Outfit {
  id: string;
  name: string;
  items: string[];
  scene?: SceneType;
  createdAt: number;
}

export interface CanvasItem {
  clothingId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: '上衣',
  bottom: '下装',
  outerwear: '外套',
  dress: '连衣裙',
  shoes: '鞋履',
  accessory: '配饰',
};

export const TRANSFORM_CATEGORY_LABELS: Record<TransformCategory, string> = {
  cut: '裁剪',
  dye: '染色',
  patchwork: '拼接',
  decorate: '装饰',
};

export const SCENE_LABELS: Record<SceneType, string> = {
  class: '上课',
  commute: '通勤',
  travel: '出游',
  photo: '拍照',
  date: '约会',
};

export const COLOR_OPTIONS = [
  { value: '白色', label: '白色' },
  { value: '黑色', label: '黑色' },
  { value: '灰色', label: '灰色' },
  { value: '米色', label: '米色' },
  { value: '棕色', label: '棕色' },
  { value: '红色', label: '红色' },
  { value: '蓝色', label: '蓝色' },
  { value: '绿色', label: '绿色' },
  { value: '黄色', label: '黄色' },
  { value: '粉色', label: '粉色' },
  { value: '紫色', label: '紫色' },
  { value: '牛仔', label: '牛仔蓝' },
];
