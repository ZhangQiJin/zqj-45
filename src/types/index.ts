export type ClothingCategory = 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory';

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  imageUrl: string;
  createdAt: number;
  tagIds: string[];
}

export type TransformCategory = 'cut' | 'dye' | 'patchwork' | 'decorate' | 'user';

export interface TransformTemplate {
  id: string;
  title: string;
  category: TransformCategory;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  steps: string[];
  beforeImage: string;
  afterImage: string;
  isUserCreated?: boolean;
  outfitId?: string;
  authorName?: string;
  likes?: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt?: number;
}

export interface UserTransform extends TransformTemplate {
  isUserCreated: true;
  outfitId: string;
  authorName: string;
  likes: number;
  isLiked: boolean;
  isFavorited: boolean;
  createdAt: number;
}

export interface TransformLike {
  transformId: string;
  userId: string;
}

export interface TransformFavorite {
  transformId: string;
  userId: string;
}

export interface TransformStepProgress {
  stepIndex: number;
  completed: boolean;
  note?: string;
  completedAt?: number;
}

export interface TransformExecution {
  transformId: string;
  stepProgress: TransformStepProgress[];
  startedAt: number;
  completedAt?: number;
}

export type SceneType = 'class' | 'commute' | 'travel' | 'photo' | 'date';

export interface Outfit {
  id: string;
  name: string;
  items: string[];
  scene?: SceneType;
  createdAt: number;
  canvasItems?: OutfitCanvasItem[];
}

export interface CanvasItem {
  clothingId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface OutfitCanvasItem {
  clothingId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export const EXPORT_DATA_VERSION = 1;

export interface ExportData {
  version: number;
  exportedAt: number;
  outfits: Outfit[];
  clothingItems: ClothingItem[];
  tags: Tag[];
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
  user: '用户创作',
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

export const TAG_COLORS = [
  { value: 'sage', label: '鼠尾草绿', bg: 'bg-sage-100', text: 'text-sage-700', border: 'border-sage-200' },
  { value: 'terracotta', label: '陶土橙', bg: 'bg-terracotta-100', text: 'text-terracotta-700', border: 'border-terracotta-200' },
  { value: 'lavender', label: '薰衣草紫', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { value: 'sky', label: '天空蓝', bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  { value: 'rose', label: '玫瑰粉', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  { value: 'amber', label: '琥珀黄', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { value: 'earth', label: '大地棕', bg: 'bg-earth-100', text: 'text-earth-700', border: 'border-earth-200' },
  { value: 'emerald', label: '翡翠绿', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
];

export const DEFAULT_TAGS = [
  { name: '最爱', color: 'rose' },
  { name: '需修补', color: 'terracotta' },
  { name: '通勤专用', color: 'sage' },
  { name: '约会', color: 'lavender' },
  { name: '运动', color: 'sky' },
  { name: '居家', color: 'amber' },
  { name: '度假', color: 'emerald' },
  { name: '正式场合', color: 'earth' },
];

export const TAG_RECOMMENDATIONS: Record<string, string[]> = {
  'top-白色': ['通勤专用', '正式场合'],
  'top-黑色': ['通勤专用', '正式场合', '最爱'],
  'top-灰色': ['通勤专用', '居家'],
  'bottom-牛仔': ['通勤专用', '约会'],
  'bottom-黑色': ['通勤专用', '正式场合'],
  'outerwear-黑色': ['通勤专用', '正式场合'],
  'dress-粉色': ['约会', '度假'],
  'dress-黑色': ['正式场合', '约会'],
  'shoes-白色': ['通勤专用', '运动'],
  'shoes-黑色': ['正式场合', '通勤专用'],
  'accessory-金色': ['正式场合', '约会'],
};

export interface WearRecord {
  id: string;
  date: string;
  clothingIds: string[];
  note?: string;
  createdAt: number;
}

export interface ClothingWearStats {
  clothingId: string;
  totalWears: number;
  lastWornDate: string | null;
  wearDates: string[];
}

export interface CategoryPreference {
  categories: ClothingCategory[];
  count: number;
}

export interface ColorPairPreference {
  color1: string;
  color2: string;
  count: number;
}

export interface ScenePreference {
  scene: SceneType;
  categoryPreferences: CategoryPreference[];
  colorPairPreferences: ColorPairPreference[];
}

export interface UserPreferences {
  scenePreferences: ScenePreference[];
  totalFeedbacks: number;
}
