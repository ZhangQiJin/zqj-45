import { useState, useEffect } from 'react';
import { Plus, Shirt, Tag as TagIcon, Settings, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ClothingCategory, CATEGORY_LABELS, TAG_COLORS, ClothingItem } from '@/types';
import ClothingCard from '@/components/ClothingCard';
import CategoryTag from '@/components/CategoryTag';
import UploadModal from '@/components/UploadModal';
import TagManagerModal from '@/components/TagManagerModal';
import ClothingTagModal from '@/components/ClothingTagModal';
import { cn } from '@/lib/utils';

const categories: (ClothingCategory | 'all')[] = [
  'all',
  'top',
  'bottom',
  'outerwear',
  'dress',
  'shoes',
  'accessory',
];

export default function Wardrobe() {
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [tagModalItem, setTagModalItem] = useState<ClothingItem | null>(null);

  const clothingItems = useStore((state) => state.clothingItems);
  const tags = useStore((state) => state.tags);
  const initializeDefaultTags = useStore((state) => state.initializeDefaultTags);

  useEffect(() => {
    initializeDefaultTags();
  }, [initializeDefaultTags]);

  const getColorClasses = (colorValue: string) => {
    const color = TAG_COLORS.find((c) => c.value === colorValue);
    return color || TAG_COLORS[0];
  };

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearTagFilters = () => {
    setSelectedTagIds([]);
  };

  const filteredItems = clothingItems.filter((item) => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    const itemTagIds = item.tagIds || [];
    const tagsMatch =
      selectedTagIds.length === 0 ||
      selectedTagIds.every((tagId) => itemTagIds.includes(tagId));
    return categoryMatch && tagsMatch;
  });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-earth-800">我的衣橱</h1>
            <p className="text-earth-500 mt-1">
              共 {clothingItems.length} 件衣物 · 让每件旧衣焕发新生
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 self-start"
          >
            <Plus className="w-5 h-5" />
            添加衣物
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-medium text-earth-700 flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              标签筛选
              {selectedTagIds.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-700">
                  已选 {selectedTagIds.length} 个
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {selectedTagIds.length > 0 && (
                <button
                  onClick={clearTagFilters}
                  className="text-xs text-earth-500 hover:text-earth-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  清除筛选
                </button>
              )}
              <button
                onClick={() => setIsTagManagerOpen(true)}
                className="text-xs text-sage-600 hover:text-sage-700 flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                管理标签
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-sm text-earth-400">还没有标签，点击"管理标签"创建</p>
            ) : (
              tags.map((tag) => {
                const colorClasses = getColorClasses(tag.color);
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagFilter(tag.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                      isSelected
                        ? `${colorClasses.bg} ${colorClasses.text} ring-2 ring-offset-1 ${colorClasses.border.replace('border-', 'ring-')}`
                        : 'bg-earth-100 text-earth-500 hover:bg-earth-200'
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <CategoryTag
              key={cat}
              label={cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              color="sage"
            />
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-earth-100 flex items-center justify-center mb-4">
              <Shirt className="w-10 h-10 text-earth-400" />
            </div>
            <h3 className="text-lg font-medium text-earth-700 mb-2">
              {selectedTagIds.length > 0
                ? '没有符合条件的衣物'
                : activeCategory === 'all'
                ? '衣橱还是空的'
                : '这个分类还没有衣物'}
            </h3>
            <p className="text-earth-500 mb-6">
              {selectedTagIds.length > 0
                ? '试试调整标签筛选条件'
                : activeCategory === 'all'
                ? '点击上方按钮，开始记录你的第一件旧衣吧'
                : '添加衣物时选择对应分类'}
            </p>
            {selectedTagIds.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加第一件衣物
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                onTagClick={() => setTagModalItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <TagManagerModal isOpen={isTagManagerOpen} onClose={() => setIsTagManagerOpen(false)} />
      <ClothingTagModal
        isOpen={!!tagModalItem}
        onClose={() => setTagModalItem(null)}
        clothingItem={tagModalItem}
      />
    </div>
  );
}
