import { ExportData, EXPORT_DATA_VERSION, Outfit, ClothingItem, Tag } from '@/types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: ExportData;
}

export interface ImportResult {
  outfits: Outfit[];
  clothingItems: ClothingItem[];
  tags: Tag[];
}

export const validateExportData = (data: unknown): ValidationResult => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '数据格式无效：不是有效的JSON对象' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    return { valid: false, error: '数据格式无效：缺少版本号' };
  }

  if (obj.version > EXPORT_DATA_VERSION) {
    return {
      valid: false,
      error: `版本不兼容：文件版本为 ${obj.version}，当前应用支持的最高版本为 ${EXPORT_DATA_VERSION}。请更新应用后重试。`,
    };
  }

  if (obj.version < EXPORT_DATA_VERSION) {
    return {
      valid: false,
      error: `版本不兼容：文件版本为 ${obj.version}，当前应用版本为 ${EXPORT_DATA_VERSION}。该旧版本文件不再支持。`,
    };
  }

  if (typeof obj.exportedAt !== 'number') {
    return { valid: false, error: '数据格式无效：缺少导出时间' };
  }

  if (!Array.isArray(obj.outfits)) {
    return { valid: false, error: '数据格式无效：缺少搭配方案列表' };
  }

  if (!Array.isArray(obj.clothingItems)) {
    return { valid: false, error: '数据格式无效：缺少衣物列表' };
  }

  if (!Array.isArray(obj.tags)) {
    return { valid: false, error: '数据格式无效：缺少标签列表' };
  }

  for (let i = 0; i < obj.outfits.length; i++) {
    const outfit = obj.outfits[i] as Record<string, unknown>;
    if (typeof outfit.name !== 'string' || !outfit.name.trim()) {
      return { valid: false, error: `数据格式无效：第 ${i + 1} 个搭配方案缺少名称` };
    }
    if (!Array.isArray(outfit.items)) {
      return { valid: false, error: `数据格式无效：搭配方案「${outfit.name}」缺少衣物列表` };
    }
  }

  for (let i = 0; i < obj.clothingItems.length; i++) {
    const item = obj.clothingItems[i] as Record<string, unknown>;
    if (typeof item.name !== 'string' || !item.name.trim()) {
      return { valid: false, error: `数据格式无效：第 ${i + 1} 个衣物缺少名称` };
    }
    if (typeof item.category !== 'string') {
      return { valid: false, error: `数据格式无效：衣物「${item.name}」缺少分类` };
    }
    if (typeof item.imageUrl !== 'string') {
      return { valid: false, error: `数据格式无效：衣物「${item.name}」缺少图片` };
    }
  }

  return { valid: true, data: obj as unknown as ExportData };
};

export const exportOutfits = (
  outfits: Outfit[],
  clothingItems: ClothingItem[],
  tags: Tag[]
): void => {
  const data: ExportData = {
    version: EXPORT_DATA_VERSION,
    exportedAt: Date.now(),
    outfits,
    clothingItems,
    tags,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  link.download = `outfits-export-${dateStr}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseImportFile = async (file: File): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const result = validateExportData(data);
        resolve(result);
      } catch {
        resolve({ valid: false, error: '文件解析失败：不是有效的JSON文件' });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: '文件读取失败' });
    };

    reader.readAsText(file);
  });
};

export interface PreviewImportResult {
  data: ExportData;
  newOutfitsCount: number;
  newClothingCount: number;
  newTagsCount: number;
  existingOutfitsCount: number;
  existingClothingCount: number;
  existingTagsCount: number;
}

export const getPreviewImportData = (
  data: ExportData,
  existingClothingIds: Set<string>,
  existingTagNames: Set<string>
): PreviewImportResult => {
  const existingClothingCount = data.clothingItems.filter((c) => existingClothingIds.has(c.id)).length;
  const existingTagsCount = data.tags.filter((t) => existingTagNames.has(t.name)).length;

  return {
    data,
    newOutfitsCount: data.outfits.length,
    newClothingCount: data.clothingItems.length - existingClothingCount,
    newTagsCount: data.tags.length - existingTagsCount,
    existingOutfitsCount: 0,
    existingClothingCount,
    existingTagsCount,
  };
};
