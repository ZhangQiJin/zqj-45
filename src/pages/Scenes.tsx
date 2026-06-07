import { useState } from 'react';
import { Sparkles, Lightbulb, RefreshCw, Heart, X } from 'lucide-react';
import { SceneType, SCENE_LABELS } from '@/types';
import { sceneRecommendations } from '@/data/scenes';
import { useStore } from '@/store/useStore';
import CategoryTag from '@/components/CategoryTag';
import ClothingCard from '@/components/ClothingCard';

const scenes: SceneType[] = ['class', 'commute', 'travel', 'photo', 'date'];

export default function Scenes() {
  const [activeScene, setActiveScene] = useState<SceneType>('class');
  const [recommendedItems, setRecommendedItems] = useState<ReturnType<typeof getRandomOutfitForScene>>([]);
  const [hasFeedback, setHasFeedback] = useState(false);
  const clothingItems = useStore((state) => state.clothingItems);
  const getRandomOutfitForScene = useStore((state) => state.getRandomOutfitForScene);
  const recordPreference = useStore((state) => state.recordPreference);
  const totalFeedbacks = useStore((state) => state.userPreferences.totalFeedbacks);

  const currentScene = sceneRecommendations.find((s) => s.scene === activeScene);

  const handleGenerate = () => {
    if (clothingItems.length === 0) {
      alert('先去衣橱添加一些衣物吧～');
      return;
    }
    const items = getRandomOutfitForScene(activeScene);
    setRecommendedItems(items);
    setHasFeedback(false);
  };

  const handleLike = () => {
    if (recommendedItems.length === 0 || hasFeedback) return;
    recordPreference(activeScene, recommendedItems);
    setHasFeedback(true);
  };

  const handleDislike = () => {
    if (hasFeedback) return;
    handleGenerate();
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-earth-800">场景推荐</h1>
          <p className="text-earth-500 mt-1">根据不同场合，为你推荐合适的穿搭</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {scenes.map((scene) => (
            <CategoryTag
              key={scene}
              label={SCENE_LABELS[scene]}
              active={activeScene === scene}
              onClick={() => {
                setActiveScene(scene);
                setRecommendedItems([]);
              }}
              color="earth"
            />
          ))}
        </div>

        {currentScene && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-sage-50 to-terracotta-50 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-soft">
                    <Sparkles className="w-6 h-6 text-sage-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-earth-800">{currentScene.title}</h3>
                    <p className="text-sm text-earth-500">{currentScene.description}</p>
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-4 mb-4">
                  <h4 className="flex items-center gap-2 text-sm font-medium text-earth-700 mb-2">
                    <Lightbulb className="w-4 h-4 text-terracotta-500" />
                    穿搭小贴士
                  </h4>
                  <ul className="space-y-1.5">
                    {currentScene.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-earth-600 flex items-start gap-2">
                        <span className="text-sage-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  生成推荐搭配
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-soft p-6 min-h-[400px]">
                <h3 className="font-semibold text-earth-800 mb-4">推荐搭配</h3>

                {recommendedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-earth-400">
                    <div className="w-16 h-16 rounded-full bg-earth-50 flex items-center justify-center mb-3">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <p className="font-medium text-earth-600">点击左侧按钮生成搭配</p>
                    <p className="text-sm mt-1">
                      {clothingItems.length === 0
                        ? '先去衣橱添加衣物，才能获得推荐哦'
                        : '根据场景智能推荐适合的衣物组合'}
                    </p>
                    {totalFeedbacks > 0 && (
                      <p className="text-xs text-sage-600 mt-4">
                        已收集 {totalFeedbacks} 次偏好反馈，推荐会越来越精准～
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {recommendedItems.map((item) => (
                        <ClothingCard key={item.id} item={item} showDelete={false} />
                      ))}
                    </div>

                    <div className="p-4 bg-earth-50 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-earth-600">
                            共 {recommendedItems.length} 件单品
                          </p>
                          {totalFeedbacks > 0 && (
                            <p className="text-xs text-sage-600 mt-0.5">
                              已学习 {totalFeedbacks} 次偏好，推荐越来越懂你～
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleGenerate}
                          className="btn-secondary flex items-center gap-2 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          换一组
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleDislike}
                          disabled={hasFeedback}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                            hasFeedback
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-earth-200 text-earth-600 hover:border-terracotta-300 hover:text-terracotta-600 hover:bg-terracotta-50'
                          }`}
                        >
                          <X className="w-5 h-5" />
                          <span className="font-medium">不喜欢</span>
                        </button>
                        <button
                          onClick={handleLike}
                          disabled={hasFeedback}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                            hasFeedback
                              ? 'bg-sage-100 text-sage-700 cursor-default'
                              : 'bg-sage-500 text-white hover:bg-sage-600 shadow-soft hover:shadow-md'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${hasFeedback ? 'fill-current' : ''}`} />
                          <span className="font-medium">
                            {hasFeedback ? '已记录' : '喜欢'}
                          </span>
                        </button>
                      </div>

                      {hasFeedback && (
                        <p className="text-center text-xs text-sage-600 mt-3">
                          🎉 已记录你的偏好，下次推荐会更精准哦！
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {clothingItems.length === 0 && (
                <div className="mt-4 p-4 bg-terracotta-50 rounded-xl border border-terracotta-100">
                  <p className="text-sm text-terracotta-700">
                    💡 提示：你的衣橱还没有衣物，先去「我的衣橱」添加一些旧衣，
                    就能获得更精准的场景穿搭推荐啦！
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
