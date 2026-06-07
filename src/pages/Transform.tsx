import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { TransformCategory, TRANSFORM_CATEGORY_LABELS } from '@/types';
import { transformTemplates } from '@/data/transforms';
import TransformCard from '@/components/TransformCard';
import CategoryTag from '@/components/CategoryTag';

const categories: (TransformCategory | 'all')[] = [
  'all',
  'cut',
  'dye',
  'patchwork',
  'decorate',
];

export default function Transform() {
  const [activeCategory, setActiveCategory] = useState<TransformCategory | 'all'>('all');

  const filteredTemplates =
    activeCategory === 'all'
      ? transformTemplates
      : transformTemplates.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-earth-800">改造灵感</h1>
          <p className="text-earth-500 mt-1">
            简单几步，让旧衣物重获新生
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <CategoryTag
              key={cat}
              label={cat === 'all' ? '全部' : TRANSFORM_CATEGORY_LABELS[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              color="terracotta"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTemplates.map((template) => (
            <TransformCard key={template.id} template={template} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-sage-50 to-terracotta-50 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-soft">
              <Lightbulb className="w-6 h-6 text-terracotta-500" />
            </div>
            <div>
              <h3 className="font-semibold text-earth-800 mb-1">环保小贴士</h3>
              <p className="text-earth-600 text-sm leading-relaxed">
                每件衣服平均被穿 7 次就会被丢弃。通过改造和重新搭配，我们可以延长衣物的使用寿命，
                减少时尚产业对环境的影响。哪怕只是简单的裁剪或染色，都是对地球的一份善意。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
