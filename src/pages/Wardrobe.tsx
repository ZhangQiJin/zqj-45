import { useState } from 'react';
import { Plus, Shirt } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ClothingCategory, CATEGORY_LABELS } from '@/types';
import ClothingCard from '@/components/ClothingCard';
import CategoryTag from '@/components/CategoryTag';
import UploadModal from '@/components/UploadModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const clothingItems = useStore((state) => state.clothingItems);

  const filteredItems =
    activeCategory === 'all'
      ? clothingItems
      : clothingItems.filter((item) => item.category === activeCategory);

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
              {activeCategory === 'all' ? '衣橱还是空的' : '这个分类还没有衣物'}
            </h3>
            <p className="text-earth-500 mb-6">
              {activeCategory === 'all'
                ? '点击上方按钮，开始记录你的第一件旧衣吧'
                : '添加衣物时选择对应分类'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加第一件衣物
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
