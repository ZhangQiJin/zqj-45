import { useEffect, useState, useMemo } from 'react';
import { X, Check, AlertCircle, FileJson, Shirt, Tags, Palette, Heart } from 'lucide-react';
import { ExportData, CATEGORY_LABELS, ClothingItem } from '@/types';

interface ImportPreviewModalProps {
  data: ExportData;
  existingClothingIds: Set<string>;
  existingTagNames: Set<string>;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ImportPreviewModal({
  data,
  existingClothingIds,
  existingTagNames,
  fileName,
  onConfirm,
  onCancel,
}: ImportPreviewModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        setTimeout(onCancel, 200);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const { newClothingItems, newTagsCount, existingClothingCount, existingTagsCount } = useMemo(() => {
    const newClothing: ClothingItem[] = [];
    let existingClothing = 0;
    data.clothingItems.forEach((item) => {
      if (existingClothingIds.has(item.id)) {
        existingClothing++;
      } else {
        newClothing.push(item);
      }
    });

    let newTags = 0;
    let existingTags = 0;
    data.tags.forEach((tag) => {
      if (existingTagNames.has(tag.name)) {
        existingTags++;
      } else {
        newTags++;
      }
    });

    return {
      newClothingItems: newClothing,
      newTagsCount: newTags,
      existingClothingCount: existingClothing,
      existingTagsCount: existingTags,
    };
  }, [data, existingClothingIds, existingTagNames]);

  const newOutfitsCount = data.outfits.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl shadow-soft-hover w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-earth-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-earth-800">确认导入</h3>
              <p className="text-sm text-earth-500">{fileName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-earth-100 transition-colors"
          >
            <X className="w-5 h-5 text-earth-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-sage-50 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-sage-100 flex items-center justify-center mb-2">
                <Palette className="w-5 h-5 text-sage-600" />
              </div>
              <p className="text-2xl font-bold text-sage-700">{newOutfitsCount}</p>
              <p className="text-sm text-sage-600">
                新增搭配
              </p>
            </div>
            <div className="bg-terracotta-50 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-terracotta-100 flex items-center justify-center mb-2">
                <Shirt className="w-5 h-5 text-terracotta-600" />
              </div>
              <p className="text-2xl font-bold text-terracotta-700">{newClothingItems.length}</p>
              <p className="text-sm text-terracotta-600">
                新增衣物
                {existingClothingCount > 0 && (
                  <span className="text-earth-400 ml-1">({existingClothingCount}个已存在)</span>
                )}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Tags className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700">{newTagsCount}</p>
              <p className="text-sm text-purple-600">
                新增标签
                {existingTagsCount > 0 && (
                  <span className="text-earth-400 ml-1">({existingTagsCount}个已存在)</span>
                )}
              </p>
            </div>
            {data.userPreferences && (
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-lg bg-rose-100 flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <p className="text-2xl font-bold text-rose-700">{data.userPreferences.totalFeedbacks}</p>
                <p className="text-sm text-rose-600">
                  偏好反馈
                </p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-earth-500 mb-2">
              导出时间：{formatDate(data.exportedAt)}
            </p>
          </div>

          {data.outfits.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-earth-800 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-sage-600" />
                搭配方案列表
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {data.outfits.map((outfit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl border bg-sage-50 border-sage-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sage-200">
                        <Check className="w-4 h-4 text-sage-700" />
                      </div>
                      <div>
                        <p className="font-medium text-earth-800">{outfit.name}</p>
                        <p className="text-xs text-earth-500">
                          {outfit.items.length} 件衣物
                          {outfit.canvasItems && outfit.canvasItems.length > 0 && (
                            <span className="ml-2">· 包含画布布局</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-sage-100 text-sage-700">
                      新增
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newClothingItems.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-earth-800 mb-3 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-terracotta-600" />
                新增衣物预览
              </h4>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                {newClothingItems.slice(0, 12).map((item, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-earth-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                      <p className="text-white text-xs truncate">{item.name}</p>
                      <p className="text-white/70 text-[10px]">
                        {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                      </p>
                    </div>
                  </div>
                ))}
                {newClothingItems.length > 12 && (
                  <div className="aspect-square rounded-lg bg-earth-100 flex items-center justify-center">
                    <span className="text-earth-500 text-sm">
                      +{newClothingItems.length - 12}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">提示</p>
                <ul className="space-y-1 list-disc list-inside text-amber-700">
                  <li>ID相同的衣物和名称相同的标签会自动跳过，不会重复导入</li>
                  <li>导入的搭配方案会作为新方案添加，不会覆盖现有方案</li>
                  <li>场景推荐偏好数据会与现有数据合并，累计统计次数</li>
                  <li>导入后可在「搭配试排」和「场景推荐」页面查看和使用</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-earth-100">
          <button onClick={handleClose} className="flex-1 btn-secondary">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
}
