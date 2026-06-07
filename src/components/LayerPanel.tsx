import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Layers } from 'lucide-react';
import { CanvasItem, ClothingItem } from '@/types';

interface LayerPanelProps {
  canvasItems: CanvasItem[];
  clothingItems: ClothingItem[];
  selectedItemId: string | null;
  onSelectItem: (clothingId: string | null) => void;
  onBringToFront: (clothingId: string) => void;
  onSendToBack: (clothingId: string) => void;
  onBringForward: (clothingId: string) => void;
  onSendBackward: (clothingId: string) => void;
}

export default function LayerPanel({
  canvasItems,
  clothingItems,
  selectedItemId,
  onSelectItem,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
}: LayerPanelProps) {
  const sortedItems = [...canvasItems].sort((a, b) => b.zIndex - a.zIndex);

  const getClothingItem = (clothingId: string) => {
    return clothingItems.find((c) => c.id === clothingId);
  };

  const isTopLayer = (clothingId: string) => {
    return sortedItems[0]?.clothingId === clothingId;
  };

  const isBottomLayer = (clothingId: string) => {
    return sortedItems[sortedItems.length - 1]?.clothingId === clothingId;
  };

  if (canvasItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-earth-600" />
        <h3 className="font-semibold text-earth-800">图层管理</h3>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
        {sortedItems.map((item) => {
          const clothing = getClothingItem(item.clothingId);
          if (!clothing) return null;

          const isSelected = selectedItemId === item.clothingId;

          return (
            <div
              key={item.clothingId}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-sage-100 border-2 border-sage-400'
                  : 'bg-earth-50 border-2 border-transparent hover:bg-earth-100'
              }`}
              onClick={() => onSelectItem(isSelected ? null : item.clothingId)}
            >
              <img
                src={clothing.imageUrl}
                alt={clothing.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-earth-800 truncate">
                  {clothing.name}
                </p>
                <p className="text-xs text-earth-500">
                  {clothing.color}
                </p>
              </div>

              {isSelected && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBringToFront(item.clothingId);
                    }}
                    disabled={isTopLayer(item.clothingId)}
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="置顶"
                  >
                    <ChevronsUp className="w-4 h-4 text-earth-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBringForward(item.clothingId);
                    }}
                    disabled={isTopLayer(item.clothingId)}
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="上移一层"
                  >
                    <ChevronUp className="w-4 h-4 text-earth-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendBackward(item.clothingId);
                    }}
                    disabled={isBottomLayer(item.clothingId)}
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="下移一层"
                  >
                    <ChevronDown className="w-4 h-4 text-earth-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToBack(item.clothingId);
                    }}
                    disabled={isBottomLayer(item.clothingId)}
                    className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="置底"
                  >
                    <ChevronsDown className="w-4 h-4 text-earth-600" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-earth-400 mt-3">
        点击图层选中，使用箭头按钮调整叠放顺序
      </p>
    </div>
  );
}
