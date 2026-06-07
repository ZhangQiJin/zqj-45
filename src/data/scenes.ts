import { SceneType } from '@/types';

export interface SceneRecommendation {
  scene: SceneType;
  title: string;
  description: string;
  tips: string[];
  suggestedCategories: string[];
}

export const sceneRecommendations: SceneRecommendation[] = [
  {
    scene: 'class',
    title: '上课穿搭',
    description: '舒适自在又不失整洁，适合长时间坐着听课',
    tips: [
      '优先选择舒适不紧绷的面料',
      '避免过于暴露或夸张的款式',
      '平底鞋方便课间移动',
      '双肩包解放双手',
    ],
    suggestedCategories: ['top', 'bottom', 'shoes', 'outerwear'],
  },
  {
    scene: 'commute',
    title: '通勤穿搭',
    description: '简约干练，兼顾舒适与专业感',
    tips: [
      '选择挺括但不僵硬的面料',
      '深浅搭配更显质感',
      '舒适的单鞋或乐福鞋',
      '一件百搭外套应对温差',
    ],
    suggestedCategories: ['top', 'bottom', 'outerwear', 'shoes'],
  },
  {
    scene: 'travel',
    title: '出游穿搭',
    description: '轻便实用，上镜又方便活动',
    tips: [
      '多层次穿搭应对天气变化',
      '选择耐脏的颜色和面料',
      '舒适的运动鞋是首选',
      '帽子和墨镜增加造型感',
    ],
    suggestedCategories: ['top', 'bottom', 'outerwear', 'shoes', 'accessory'],
  },
  {
    scene: 'photo',
    title: '拍照穿搭',
    description: '色彩鲜明有层次，上镜效果满分',
    tips: [
      '纯色背景选鲜艳颜色',
      '繁简搭配避免杂乱',
      '适当露肤增加轻盈感',
      '配饰是点睛之笔',
    ],
    suggestedCategories: ['top', 'bottom', 'dress', 'accessory', 'shoes'],
  },
  {
    scene: 'date',
    title: '约会穿搭',
    description: '温柔有气质，展现个人风格',
    tips: [
      '选择柔和的色系',
      '适度展现身材优势',
      '淡淡的香味加分',
      '小巧精致的配饰',
    ],
    suggestedCategories: ['dress', 'top', 'bottom', 'shoes', 'accessory'],
  },
];
