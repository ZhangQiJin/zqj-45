import { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Save, Shuffle, X, Palette as PaletteIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ClothingItem, ClothingCategory, CATEGORY_LABELS } from '@/types';
import ClothingCard from '@/components/ClothingCard';
import CategoryTag from '@/components/CategoryTag';

const categories: ClothingCategory[] = [
  'top',
  'bottom',
  'outerwear',
  'dress',
  'shoes',
  'accessory',
];

export default function Styling() {
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('top');
  const [draggedItem, setDraggedItem] = useState<ClothingItem | null>(null);
  const [savedOutfitName, setSavedOutfitName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const clothingItems = useStore((state) => state.clothingItems);
  const currentCanvasItems = useStore((state) => state.currentCanvasItems);
  const addToCanvas = useStore((state) => state.addToCanvas);
  const updateCanvasItems = useStore((state) => state.updateCanvasItems);
  const removeFromCanvas = useStore((state) => state.removeFromCanvas);
  const clearCanvas = useStore((state) => state.clearCanvas);
  const addOutfit = useStore((state) => state.addOutfit);

  useEffect(() => {
    if (!showSaveModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSaveModal(false);
        setSavedOutfitName('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSaveModal]);

  const filteredItems = clothingItems.filter((item) => item.category === activeCategory);
  const canvasClothingItems = currentCanvasItems
    .map((canvasItem) => ({
      ...canvasItem,
      item: clothingItems.find((c) => c.id === canvasItem.clothingId),
    }))
    .filter((c) => c.item);

  const handleDragStart = (e: React.DragEvent, item: ClothingItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 80;

    addToCanvas(draggedItem.id, Math.max(0, x), Math.max(0, y));
    setDraggedItem(null);
  };

  const handleCanvasItemDrag = useCallback(
    (e: React.MouseEvent, clothingId: string) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const item = currentCanvasItems.find((c) => c.clothingId === clothingId);
      if (!item) return;

      const startItemX = item.x;
      const startItemY = item.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        updateCanvasItems(
          currentCanvasItems.map((c) =>
            c.clothingId === clothingId
              ? {
                  ...c,
                  x: Math.max(0, Math.min(startItemX + deltaX, rect.width - c.width)),
                  y: Math.max(0, Math.min(startItemY + deltaY, rect.height - c.height)),
                }
              : c
          )
        );
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [currentCanvasItems, updateCanvasItems]
  );

  const handleSave = () => {
    if (!savedOutfitName.trim()) {
      alert('请输入搭配名称');
      return;
    }
    addOutfit({
      name: savedOutfitName.trim(),
      items: currentCanvasItems.map((c) => c.clothingId),
    });
    setSavedOutfitName('');
    setShowSaveModal(false);
    alert('搭配保存成功！');
  };

  const handleRandom = () => {
    if (clothingItems.length === 0) {
      alert('先去衣橱添加一些衣物吧～');
      return;
    }
    clearCanvas();
    const shuffled = [...clothingItems].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(4, shuffled.length));
    selected.forEach((item, index) => {
      addToCanvas(item.id, 50 + (index % 2) * 150, 50 + Math.floor(index / 2) * 200);
    });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-earth-800">搭配试排</h1>
            <p className="text-earth-500 mt-1">拖拽衣物到画布，创造你的专属搭配</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleRandom} className="btn-secondary flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              随机搭配
            </button>
            <button
              onClick={() => currentCanvasItems.length > 0 && clearCanvas()}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              disabled={currentCanvasItems.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
            <button
              onClick={() => currentCanvasItems.length > 0 && setShowSaveModal(true)}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
              disabled={currentCanvasItems.length === 0}
            >
              <Save className="w-4 h-4" />
              保存搭配
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <h3 className="font-semibold text-earth-800 mb-3">选择衣物</h3>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categories.map((cat) => (
                  <CategoryTag
                    key={cat}
                    label={CATEGORY_LABELS[cat]}
                    active={activeCategory === cat}
                    onClick={() => setActiveCategory(cat)}
                    color="sage"
                  />
                ))}
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-earth-400 text-sm">
                    <PaletteIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    这个分类还没有衣物
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <ClothingCard
                      key={item.id}
                      item={item}
                      showDelete={false}
                      draggable
                      onDragStart={handleDragStart}
                      className="!shadow-none !border border-earth-100 hover:!border-sage-300"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <div
              ref={canvasRef}
              className="bg-white rounded-2xl shadow-soft dashed-grid min-h-[500px] lg:min-h-[600px] relative overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {canvasClothingItems.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-earth-400">
                  <div className="w-16 h-16 rounded-full bg-earth-100 flex items-center justify-center mb-3">
                    <PaletteIcon className="w-8 h-8" />
                  </div>
                  <p className="font-medium">从左侧拖拽衣物到这里</p>
                  <p className="text-sm mt-1">画布上的衣物可以自由拖动调整位置</p>
                </div>
              ) : (
                canvasClothingItems.map(({ item, x, y, width, height }) => (
                  item && (
                    <div
                      key={item.id}
                      className="absolute cursor-move group"
                      style={{ left: x, top: y, width, height }}
                      onMouseDown={(e) => handleCanvasItemDrag(e, item.id)}
                    >
                      <div className="w-full h-full rounded-xl overflow-hidden shadow-soft-hover border-2 border-white bg-white">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCanvas(item.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-soft-hover w-full max-w-sm overflow-hidden animate-slide-up p-6">
            <h3 className="text-lg font-serif font-semibold text-earth-800 mb-4">保存搭配</h3>
            <input
              type="text"
              value={savedOutfitName}
              onChange={(e) => setSavedOutfitName(e.target.value)}
              placeholder="给这个搭配起个名字"
              className="input-field mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button onClick={handleSave} className="flex-1 btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
