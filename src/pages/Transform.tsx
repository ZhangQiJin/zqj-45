import { useState, useMemo } from 'react';
import { Lightbulb, Plus, Sparkles, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransformCategory, TRANSFORM_CATEGORY_LABELS } from '@/types';
import { transformTemplates } from '@/data/transforms';
import TransformCard from '@/components/TransformCard';
import CategoryTag from '@/components/CategoryTag';
import Empty from '@/components/Empty';
import { useStore } from '@/store/useStore';

const categories: (TransformCategory | 'all' | 'favorites')[] = [
  'all',
  'cut',
  'dye',
  'patchwork',
  'decorate',
  'user',
  'favorites',
];

export default function Transform() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<TransformCategory | 'all' | 'favorites'>('all');
  const userTransforms = useStore((state) => state.userTransforms);
  const favoritedTransformIds = useStore((state) => state.favoritedTransformIds);

  const allTemplates = useMemo(() => {
    return [
      ...transformTemplates.map((t) => ({ ...t, isUserCreated: false })),
      ...userTransforms,
    ];
  }, [userTransforms]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return allTemplates;
    }
    if (activeCategory === 'user') {
      return userTransforms;
    }
    if (activeCategory === 'favorites') {
      return allTemplates.filter((t) => favoritedTransformIds.includes(t.id));
    }
    return allTemplates.filter((t) => t.category === activeCategory);
  }, [activeCategory, allTemplates, userTransforms, favoritedTransformIds]);

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-earth-800">改造灵感</h1>
            <p className="text-earth-500 mt-1">
              简单几步，让旧衣物重获新生
            </p>
          </div>
          <button
            onClick={() => navigate('/transform/create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            发布改造方案
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <CategoryTag
              key={cat}
              label={cat === 'all' ? '全部' : cat === 'favorites' ? '我的收藏' : TRANSFORM_CATEGORY_LABELS[cat]}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              color={cat === 'favorites' ? 'amber' : 'terracotta'}
              icon={cat === 'favorites' ? <Bookmark className="w-3.5 h-3.5" /> : undefined}
            />
          ))}
        </div>

        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((template) => (
              <TransformCard key={template.id} template={template} />
            ))}
          </div>
        ) : activeCategory === 'user' ? (
          <Empty
            icon={<Sparkles className="w-8 h-8" />}
            title="还没有用户创作的改造方案"
            description="成为第一个分享创意的人吧！把你的改造灵感分享给更多人"
            action={
              <button
                onClick={() => navigate('/transform/create')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                发布第一个改造方案
              </button>
            }
          />
        ) : activeCategory === 'favorites' ? (
          <Empty
            icon={<Bookmark className="w-8 h-8" />}
            title="还没有收藏的改造方案"
            description="浏览改造灵感，点击收藏按钮保存你喜欢的方案吧"
          />
        ) : (
          <Empty
            icon={<Lightbulb className="w-8 h-8" />}
            title="该分类下暂无方案"
            description="换个分类看看，或者发布你自己的改造方案吧"
          />
        )}

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
