import { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ClothingCategory, CATEGORY_LABELS } from '@/types';
import CategoryTag from '@/components/CategoryTag';

interface WearRecordDetailProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

const categories: (ClothingCategory | 'all')[] = [
  'all',
  'top',
  'bottom',
  'outerwear',
  'dress',
  'shoes',
  'accessory',
];

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

export default function WearRecordDetail({ date, isOpen, onClose }: WearRecordDetailProps) {
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [selectedClothingIds, setSelectedClothingIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const clothingItems = useStore((state) => state.clothingItems);
  const addWearRecord = useStore((state) => state.addWearRecord);
  const removeWearRecord = useStore((state) => state.removeWearRecord);
  const getWearRecordsByDate = useStore((state) => state.getWearRecordsByDate);
  const getClothingWearStats = useStore((state) => state.getClothingWearStats);

  useEffect(() => {
    if (isOpen && date) {
      const record = getWearRecordsByDate(date);
      if (record) {
        setSelectedClothingIds(record.clothingIds);
        setNote(record.note || '');
        setIsEditing(false);
      } else {
        setSelectedClothingIds([]);
        setNote('');
        setIsEditing(true);
      }
    }
  }, [date, isOpen, getWearRecordsByDate]);

  if (!isOpen) return null;

  const filteredItems =
    activeCategory === 'all'
      ? clothingItems
      : clothingItems.filter((item) => item.category === activeCategory);

  const toggleClothing = (id: string) => {
    if (!isEditing) return;
    setSelectedClothingIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    addWearRecord({
      date,
      clothingIds: selectedClothingIds,
      note: note.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    const record = getWearRecordsByDate(date);
    if (record) {
      removeWearRecord(record.id);
    }
    onClose();
  };

  const hasRecord = selectedClothingIds.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl shadow-xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-earth-100">
          <div>
            <h3 className="text-xl font-serif font-semibold text-earth-800">
              {formatDisplayDate(date)}
            </h3>
            <p className="text-sm text-earth-500 mt-1">
              {hasRecord ? `已记录 ${selectedClothingIds.length} 件衣物` : '还没有穿着记录'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-earth-100 transition-colors"
          >
            <X className="w-5 h-5 text-earth-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-earth-700 mb-3">选择今天穿过的衣物</h4>
                <div className="flex flex-wrap gap-2 mb-4">
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
                  <div className="text-center py-8 text-earth-500">
                    这个分类还没有衣物
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {filteredItems.map((item) => {
                      const isSelected = selectedClothingIds.includes(item.id);
                      const stats = getClothingWearStats(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleClothing(item.id)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-sage-500 ring-2 ring-sage-200' : 'border-earth-200 hover:border-earth-300'}`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-sage-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                            <p className="text-white text-xs truncate">{item.name}</p>
                            {stats.totalWears > 0 && (
                              <p className="text-white/70 text-[10px]">已穿{stats.totalWears}次</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-earth-700 mb-2">备注（可选）</h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="记录今天的穿搭心得..."
                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-100 outline-none resize-none h-20"
                />
              </div>
            </>
          ) : (
            <>
              {hasRecord ? (
                <>
                  <h4 className="text-sm font-medium text-earth-700 mb-3">今天穿了</h4>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {selectedClothingIds.map((id) => {
                      const item = clothingItems.find((c) => c.id === id);
                      if (!item) return null;
                      const stats = getClothingWearStats(id);
                      return (
                        <div
                          key={id}
                          className="aspect-square rounded-xl overflow-hidden border border-earth-200"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                            <p className="text-white text-xs truncate">{item.name}</p>
                            <p className="text-white/70 text-[10px]">共穿{stats.totalWears}次</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {note && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-earth-700 mb-2">备注</h4>
                      <p className="text-earth-600 bg-earth-50 rounded-xl p-4">{note}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-earth-500">还没有记录今天穿了什么</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-earth-100 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-earth-200 text-earth-600 font-medium hover:bg-earth-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                保存记录
              </button>
            </>
          ) : (
            <>
              {hasRecord && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-colors"
              >
                {hasRecord ? '编辑记录' : '添加记录'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
