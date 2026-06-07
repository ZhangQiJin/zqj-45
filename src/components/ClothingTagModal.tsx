import { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Check, Sparkles, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TAG_COLORS, Tag, ClothingItem } from '@/types';
import { cn } from '@/lib/utils';

interface ClothingTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothingItem: ClothingItem | null;
}

export default function ClothingTagModal({ isOpen, onClose, clothingItem }: ClothingTagModalProps) {
  const {
    tags,
    addTagToClothing,
    removeTagFromClothing,
    getRecommendedTags,
    getClothingTags,
    addTag,
  } = useStore();

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewTag(false);
        setNewTagName('');
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !clothingItem) return null;

  const clothingTags = getClothingTags(clothingItem.id);
  const clothingTagIds = new Set(clothingTags.map((t) => t.id));
  const recommendedTags = getRecommendedTags(clothingItem.category, clothingItem.color);
  const recommendedTagIds = new Set(recommendedTags.map((t) => t.id));

  const getColorClasses = (colorValue: string) => {
    const color = TAG_COLORS.find((c) => c.value === colorValue);
    return color || TAG_COLORS[0];
  };

  const toggleTag = (tagId: string) => {
    if (clothingTagIds.has(tagId)) {
      removeTagFromClothing(clothingItem.id, tagId);
    } else {
      addTagToClothing(clothingItem.id, tagId);
    }
  };

  const handleAddNewTag = () => {
    if (!newTagName.trim()) return;
    const newTag = { name: newTagName.trim(), color: newTagColor };
    addTag(newTag);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0].value);
    setShowNewTag(false);
  };

  const renderTagButton = (tag: Tag, isRecommended = false) => {
    const isSelected = clothingTagIds.has(tag.id);
    const colorClasses = getColorClasses(tag.color);

    return (
      <button
        key={tag.id}
        onClick={() => toggleTag(tag.id)}
        className={cn(
          'relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
          isSelected
            ? `${colorClasses.bg} ${colorClasses.text} ring-2 ring-offset-1 ${colorClasses.border.replace('border-', 'ring-')}`
            : 'bg-earth-100 text-earth-500 hover:bg-earth-200',
          isRecommended && !isSelected && 'ring-1 ring-dashed ring-sage-300'
        )}
      >
        {isSelected && <Check className="w-3.5 h-3.5" />}
        {tag.name}
        {isRecommended && !isSelected && (
          <Sparkles className="w-3 h-3 text-sage-500" />
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-soft-hover w-full max-w-md overflow-hidden animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <div>
            <h2 className="text-lg font-serif font-semibold text-earth-800 flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              编辑标签
            </h2>
            <p className="text-sm text-earth-500 mt-1">{clothingItem.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-earth-50 text-earth-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {recommendedTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-earth-700 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sage-500" />
                智能推荐
              </h3>
              <div className="flex flex-wrap gap-2">
                {recommendedTags.map((tag) => renderTagButton(tag, true))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-earth-700">所有标签</h3>
              <button
                onClick={() => setShowNewTag(!showNewTag)}
                className="text-xs text-sage-600 hover:text-sage-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                新建标签
              </button>
            </div>

            {showNewTag && (
              <div className="mb-4 p-3 rounded-xl bg-earth-50 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="标签名称"
                    className="input-field text-sm flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                  />
                  <button
                    onClick={handleAddNewTag}
                    disabled={!newTagName.trim()}
                    className="btn-primary px-3 text-sm disabled:opacity-50"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewTagColor(color.value)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all duration-200',
                        color.bg,
                        newTagColor === color.value
                          ? 'border-earth-700 scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {tags.length === 0 ? (
              <div className="text-center py-8 text-earth-400">
                <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">还没有标签，点击上方新建</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => renderTagButton(tag))}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-earth-100">
          <div className="flex items-center justify-between text-sm text-earth-500 mb-3">
            <span>已选择 {clothingTagIds.size} 个标签</span>
          </div>
          <button onClick={onClose} className="w-full btn-primary">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
