import { Sparkles, Plus, Info } from 'lucide-react';
import { ClothingItem } from '@/types';
import { ColorMatchResult, getScoreColor, getScoreBgColor, getColorInfo } from '@/utils/colorMatching';
import { useState } from 'react';

interface ColorRecommendationProps {
  baseItem: ClothingItem | null;
  recommendations: ColorMatchResult[];
  onAddToCanvas: (item: ClothingItem) => void;
}

export default function ColorRecommendation({
  baseItem,
  recommendations,
  onAddToCanvas,
}: ColorRecommendationProps) {
  const [showInfo, setShowInfo] = useState(false);

  if (!baseItem) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-sage-500" />
          <h3 className="font-semibold text-earth-800">智能搭配推荐</h3>
        </div>
        <div className="text-center py-8 text-earth-400 text-sm">
          <div className="w-14 h-14 rounded-full bg-earth-50 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-earth-300" />
          </div>
          <p className="font-medium text-earth-600">选择或拖拽一件衣物到画布</p>
          <p className="mt-1">系统将自动为你推荐协调的搭配</p>
        </div>
      </div>
    );
  }

  const baseColorInfo = getColorInfo(baseItem.color);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sage-500" />
          <h3 className="font-semibold text-earth-800">智能搭配推荐</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 rounded-full hover:bg-earth-50 text-earth-400 hover:text-earth-600 transition-colors"
          title="搭配规则说明"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-sage-50 rounded-xl text-xs text-earth-600 space-y-1.5">
          <p className="font-medium text-sage-700">💡 搭配规则说明：</p>
          <p>• <span className="font-medium">互补色</span>：色环上相对的颜色，强烈对比</p>
          <p>• <span className="font-medium">邻近色</span>：色环上相邻的颜色，和谐过渡</p>
          <p>• <span className="font-medium">同色系</span>：同一色相不同深浅，高级质感</p>
          <p>• <span className="font-medium">三角色</span>：色环上等距的三色，活力平衡</p>
          <p>• <span className="font-medium">中性色</span>：黑白灰米色，百搭经典</p>
        </div>
      )}

      <div className="flex items-center gap-3 p-3 bg-earth-50 rounded-xl mb-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
          <img
            src={baseItem.imageUrl}
            alt={baseItem.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-earth-800 truncate">{baseItem.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{
                backgroundColor: baseColorInfo.isNeutral
                  ? baseColorInfo.lightness > 50 ? '#f5f5f5' : '#4a4a4a'
                  : `hsl(${baseColorInfo.hue}, ${baseColorInfo.saturation}%, ${baseColorInfo.lightness}%)`,
              }}
            />
            <span className="text-sm text-earth-500">{baseItem.color}</span>
          </div>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-6 text-earth-400 text-sm">
          <p>暂无其他衣物可推荐</p>
          <p className="mt-1">去衣橱添加更多衣物吧～</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-hide pr-1">
          {recommendations.slice(0, 8).map((result) => (
            <div
              key={result.item.id}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-earth-100 hover:border-sage-200 hover:bg-sage-50/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-earth-50 flex-shrink-0">
                <img
                  src={result.item.imageUrl}
                  alt={result.item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-earth-800 text-sm truncate">
                    {result.item.name}
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}
                  >
                    {result.score}分
                  </span>
                </div>
                <p className="text-xs text-earth-500 mt-0.5 line-clamp-2">
                  {result.reason}
                </p>
              </div>

              <button
                onClick={() => onAddToCanvas(result.item)}
                className="p-2 rounded-lg bg-sage-100 text-sage-600 hover:bg-sage-200 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="添加到画布"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
