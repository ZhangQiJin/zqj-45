import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Trash2, Save, Shuffle, X, Palette as PaletteIcon, ZoomIn, ZoomOut, RotateCcw, Download, Upload, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ClothingItem, ClothingCategory, CATEGORY_LABELS, ExportData } from '@/types';
import ClothingCard from '@/components/ClothingCard';
import CategoryTag from '@/components/CategoryTag';
import ColorRecommendation from '@/components/ColorRecommendation';
import LayerPanel from '@/components/LayerPanel';
import ImportPreviewModal from '@/components/ImportPreviewModal';
import { getColorRecommendations, ColorMatchResult } from '@/utils/colorMatching';
import { exportOutfits, parseImportFile, processImportData, ImportResult, ValidationResult } from '@/utils/outfitImportExport';

const categories: ClothingCategory[] = [
  'top',
  'bottom',
  'outerwear',
  'dress',
  'shoes',
  'accessory',
];

interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  color: string;
}

const SNAP_THRESHOLD = 8;
const GUIDE_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Styling() {
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('top');
  const [draggedItem, setDraggedItem] = useState<ClothingItem | null>(null);
  const [savedOutfitName, setSavedOutfitName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [baseItem, setBaseItem] = useState<ClothingItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clothingItems = useStore((state) => state.clothingItems);
  const outfits = useStore((state) => state.outfits);
  const tags = useStore((state) => state.tags);
  const currentCanvasItems = useStore((state) => state.currentCanvasItems);
  const addToCanvas = useStore((state) => state.addToCanvas);
  const updateCanvasItems = useStore((state) => state.updateCanvasItems);
  const removeFromCanvas = useStore((state) => state.removeFromCanvas);
  const clearCanvas = useStore((state) => state.clearCanvas);
  const addOutfit = useStore((state) => state.addOutfit);
  const addClothingItem = useStore((state) => state.addClothingItem);
  const addTag = useStore((state) => state.addTag);
  const bringToFront = useStore((state) => state.bringToFront);
  const sendToBack = useStore((state) => state.sendToBack);
  const bringForward = useStore((state) => state.bringForward);
  const sendBackward = useStore((state) => state.sendBackward);

  const canvasItemIds = useMemo(
    () => currentCanvasItems.map((c) => c.clothingId),
    [currentCanvasItems]
  );

  const recommendations: ColorMatchResult[] = useMemo(() => {
    if (!baseItem) return [];
    return getColorRecommendations(baseItem, clothingItems, canvasItemIds);
  }, [baseItem, clothingItems, canvasItemIds]);

  const gridSize = useMemo(() => {
    const baseSize = 40;
    if (zoom >= 2) return baseSize / 2;
    if (zoom >= 1.5) return baseSize;
    if (zoom >= 1) return baseSize;
    if (zoom >= 0.75) return baseSize * 1.5;
    return baseSize * 2;
  }, [zoom]);

  useEffect(() => {
    if (baseItem) {
      const stillExists = clothingItems.find((c) => c.id === baseItem.id);
      if (!stillExists) {
        setBaseItem(null);
      }
      return;
    }
    if (currentCanvasItems.length > 0) {
      const firstCanvasItemId = currentCanvasItems[0]?.clothingId;
      const firstItem = clothingItems.find((c) => c.id === firstCanvasItemId);
      if (firstItem) {
        setBaseItem(firstItem);
      }
    }
  }, [currentCanvasItems, clothingItems, baseItem]);

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
    .filter((c) => c.item)
    .sort((a, b) => a.zIndex - b.zIndex);

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
    const x = (e.clientX - rect.left) / zoom - 60;
    const y = (e.clientY - rect.top) / zoom - 80;

    addToCanvas(draggedItem.id, Math.max(0, x), Math.max(0, y));
    if (!baseItem) {
      setBaseItem(draggedItem);
    }
    setDraggedItem(null);
  };

  const handleAddRecommendationToCanvas = (item: ClothingItem) => {
    const existingCount = currentCanvasItems.length;
    const x = 50 + (existingCount % 3) * 140;
    const y = 50 + Math.floor(existingCount / 3) * 180;
    addToCanvas(item.id, x, y);
  };

  const handleClothingCardClick = (item: ClothingItem) => {
    setBaseItem(item);
  };

  const calculateAlignment = useCallback(
    (currentItem: { x: number; y: number; width: number; height: number }, excludeId: string) => {
      const guides: AlignmentGuide[] = [];
      let snapX = currentItem.x;
      let snapY = currentItem.y;

      const currentCenterX = currentItem.x + currentItem.width / 2;
      const currentCenterY = currentItem.y + currentItem.height / 2;
      const currentRight = currentItem.x + currentItem.width;
      const currentBottom = currentItem.y + currentItem.height;

      currentCanvasItems.forEach((otherItem, index) => {
        if (otherItem.clothingId === excludeId) return;

        const otherCenterX = otherItem.x + otherItem.width / 2;
        const otherCenterY = otherItem.y + otherItem.height / 2;
        const otherRight = otherItem.x + otherItem.width;
        const otherBottom = otherItem.y + otherItem.height;

        const color = GUIDE_COLORS[index % GUIDE_COLORS.length];

        if (Math.abs(currentItem.x - otherItem.x) < SNAP_THRESHOLD) {
          snapX = otherItem.x;
          guides.push({ type: 'vertical', position: otherItem.x, color });
        }
        if (Math.abs(currentItem.x - otherRight) < SNAP_THRESHOLD) {
          snapX = otherRight;
          guides.push({ type: 'vertical', position: otherRight, color });
        }
        if (Math.abs(currentRight - otherItem.x) < SNAP_THRESHOLD) {
          snapX = otherItem.x - currentItem.width;
          guides.push({ type: 'vertical', position: otherItem.x, color });
        }
        if (Math.abs(currentRight - otherRight) < SNAP_THRESHOLD) {
          snapX = otherRight - currentItem.width;
          guides.push({ type: 'vertical', position: otherRight, color });
        }
        if (Math.abs(currentCenterX - otherCenterX) < SNAP_THRESHOLD) {
          snapX = otherCenterX - currentItem.width / 2;
          guides.push({ type: 'vertical', position: otherCenterX, color });
        }

        if (Math.abs(currentItem.y - otherItem.y) < SNAP_THRESHOLD) {
          snapY = otherItem.y;
          guides.push({ type: 'horizontal', position: otherItem.y, color });
        }
        if (Math.abs(currentItem.y - otherBottom) < SNAP_THRESHOLD) {
          snapY = otherBottom;
          guides.push({ type: 'horizontal', position: otherBottom, color });
        }
        if (Math.abs(currentBottom - otherItem.y) < SNAP_THRESHOLD) {
          snapY = otherItem.y - currentItem.height;
          guides.push({ type: 'horizontal', position: otherItem.y, color });
        }
        if (Math.abs(currentBottom - otherBottom) < SNAP_THRESHOLD) {
          snapY = otherBottom - currentItem.height;
          guides.push({ type: 'horizontal', position: otherBottom, color });
        }
        if (Math.abs(currentCenterY - otherCenterY) < SNAP_THRESHOLD) {
          snapY = otherCenterY - currentItem.height / 2;
          guides.push({ type: 'horizontal', position: otherCenterY, color });
        }
      });

      return { guides, snapX, snapY };
    },
    [currentCanvasItems]
  );

  const handleCanvasItemDrag = useCallback(
    (e: React.MouseEvent, clothingId: string) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const item = currentCanvasItems.find((c) => c.clothingId === clothingId);
      if (!item) return;

      setSelectedItemId(clothingId);

      const startItemX = item.x;
      const startItemY = item.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = (moveEvent.clientX - startX) / zoom;
        const deltaY = (moveEvent.clientY - startY) / zoom;

        let newX = Math.max(0, Math.min(startItemX + deltaX, rect.width / zoom - item.width));
        let newY = Math.max(0, Math.min(startItemY + deltaY, rect.height / zoom - item.height));

        const { guides, snapX, snapY } = calculateAlignment(
          { x: newX, y: newY, width: item.width, height: item.height },
          clothingId
        );

        if (guides.length > 0) {
          newX = snapX;
          newY = snapY;
        }

        setAlignmentGuides(guides);

        updateCanvasItems(
          currentCanvasItems.map((c) =>
            c.clothingId === clothingId
              ? {
                  ...c,
                  x: newX,
                  y: newY,
                }
              : c
          )
        );
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setAlignmentGuides([]);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [currentCanvasItems, updateCanvasItems, zoom, calculateAlignment]
  );

  const handleCanvasClick = () => {
    setSelectedItemId(null);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleSave = () => {
    if (!savedOutfitName.trim()) {
      alert('请输入搭配名称');
      return;
    }
    addOutfit(
      {
        name: savedOutfitName.trim(),
        items: currentCanvasItems.map((c) => c.clothingId),
      },
      currentCanvasItems.map((c) => ({
        clothingId: c.clothingId,
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        zIndex: c.zIndex,
      }))
    );
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

  const handleExport = () => {
    if (outfits.length === 0) {
      alert('还没有保存的搭配方案，先保存一些搭配吧～');
      return;
    }
    const outfitIds = new Set(outfits.flatMap((o) => o.items));
    const relatedClothingItems = clothingItems.filter((c) => outfitIds.has(c.id));
    const tagIds = new Set(relatedClothingItems.flatMap((c) => c.tagIds || []));
    const relatedTags = tags.filter((t) => tagIds.has(t.id));
    exportOutfits(outfits, relatedClothingItems, relatedTags);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    const result: ValidationResult = await parseImportFile(file);

    if (!result.valid || !result.data) {
      setImportError(result.error || '导入失败');
      e.target.value = '';
      return;
    }

    const existingClothingIds = new Set(clothingItems.map((c) => c.id));
    const existingTagNames = new Set(tags.map((t) => t.name));
    const processed = processImportData(result.data, existingClothingIds, existingTagNames);

    setImportData(result.data);
    setImportResult(processed);
    setImportFileName(file.name);
    setShowImportPreview(true);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importResult) return;

    importResult.tags.forEach((tag) => {
      addTag({ name: tag.name, color: tag.color });
    });

    importResult.clothingItems.forEach((item) => {
      addClothingItem({
        name: item.name,
        category: item.category as ClothingCategory,
        color: item.color,
        imageUrl: item.imageUrl,
        tagIds: item.tagIds,
      });
    });

    setTimeout(() => {
      importResult.outfits.forEach((outfit) => {
        useStore.getState().addOutfit(
          {
            name: outfit.name,
            items: outfit.items,
            scene: outfit.scene,
          },
          outfit.canvasItems
        );
      });

      setShowImportPreview(false);
      setImportData(null);
      setImportResult(null);
      setImportFileName('');
      alert('导入成功！');
    }, 100);
  };

  const handleCancelImport = () => {
    setShowImportPreview(false);
    setImportData(null);
    setImportResult(null);
    setImportFileName('');
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
            <div className="w-px h-8 bg-earth-200 mx-1 self-center" />
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              disabled={outfits.length === 0}
            >
              <Download className="w-4 h-4" />
              导出
            </button>
            <button
              onClick={handleImportClick}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              导入
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1 space-y-4">
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

              <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-hide pr-1">
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
                      onClick={() => handleClothingCardClick(item)}
                      className={`!shadow-none !border transition-all ${
                        baseItem?.id === item.id
                          ? '!border-sage-400 !ring-2 !ring-sage-200'
                          : 'border-earth-100 hover:!border-sage-300'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>

            <LayerPanel
              canvasItems={currentCanvasItems}
              clothingItems={clothingItems}
              selectedItemId={selectedItemId}
              onSelectItem={setSelectedItemId}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              onBringForward={bringForward}
              onSendBackward={sendBackward}
            />

            <ColorRecommendation
              baseItem={baseItem}
              recommendations={recommendations}
              onAddToCanvas={handleAddRecommendationToCanvas}
            />
          </div>

          <div className="lg:col-span-9 order-1 lg:order-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-earth-500">
                缩放: {Math.round(zoom * 100)}%
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg bg-white shadow-soft hover:bg-earth-50 transition-colors disabled:opacity-50"
                  disabled={zoom <= 0.5}
                  title="缩小"
                >
                  <ZoomOut className="w-4 h-4 text-earth-600" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 rounded-lg bg-white shadow-soft hover:bg-earth-50 transition-colors"
                  title="重置缩放"
                >
                  <RotateCcw className="w-4 h-4 text-earth-600" />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg bg-white shadow-soft hover:bg-earth-50 transition-colors disabled:opacity-50"
                  disabled={zoom >= 3}
                  title="放大"
                >
                  <ZoomIn className="w-4 h-4 text-earth-600" />
                </button>
              </div>
            </div>

            <div
              ref={canvasRef}
              className="bg-white rounded-2xl shadow-soft min-h-[500px] lg:min-h-[600px] relative overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(91, 140, 90, 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(91, 140, 90, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleCanvasClick}
            >
              <div
                className="w-full h-full relative"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                {canvasClothingItems.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-earth-400" style={{ transform: `scale(${1 / zoom})`, transformOrigin: 'center' }}>
                    <div className="w-16 h-16 rounded-full bg-earth-100 flex items-center justify-center mb-3">
                      <PaletteIcon className="w-8 h-8" />
                    </div>
                    <p className="font-medium">从左侧拖拽衣物到这里</p>
                    <p className="text-sm mt-1">画布上的衣物可以自由拖动调整位置</p>
                  </div>
                ) : (
                  canvasClothingItems.map(({ item, x, y, width, height, zIndex }) => (
                    item && (
                      <div
                        key={item.id}
                        className={`absolute cursor-move group transition-all duration-100 ${
                          selectedItemId === item.id ? 'ring-2 ring-sage-400 ring-offset-2 rounded-xl' : ''
                        }`}
                        style={{ left: x, top: y, width, height, zIndex }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleCanvasItemDrag(e, item.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                        }}
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
                            if (selectedItemId === item.id) {
                              setSelectedItemId(null);
                            }
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  ))
                )}

                {alignmentGuides.map((guide, index) => (
                  <div
                    key={index}
                    className="absolute pointer-events-none"
                    style={{
                      ...(guide.type === 'vertical'
                        ? {
                            left: guide.position,
                            top: 0,
                            width: '2px',
                            height: '100%',
                            backgroundColor: guide.color,
                          }
                        : {
                            left: 0,
                            top: guide.position,
                            width: '100%',
                            height: '2px',
                            backgroundColor: guide.color,
                          }),
                      zIndex: 9999,
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
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

      {importError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-soft-hover w-full max-w-sm overflow-hidden animate-slide-up p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-semibold text-earth-800">导入失败</h3>
              </div>
            </div>
            <p className="text-earth-600 mb-6">{importError}</p>
            <button
              onClick={() => setImportError(null)}
              className="w-full btn-primary"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {showImportPreview && importData && importResult && (
        <ImportPreviewModal
          data={importData}
          importResult={importResult}
          fileName={importFileName}
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
        />
      )}
    </div>
  );
}
