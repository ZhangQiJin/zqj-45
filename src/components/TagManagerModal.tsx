import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { TAG_COLORS, Tag } from '@/types';
import { cn } from '@/lib/utils';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TagManagerModal({ isOpen, onClose }: TagManagerModalProps) {
  const { tags, addTag, updateTag, removeTag } = useStore();
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetForm();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setEditingTag(null);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0].value);
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTag({ name: newTagName.trim(), color: newTagColor });
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0].value);
  };

  const handleUpdateTag = () => {
    if (!editingTag || !newTagName.trim()) return;
    updateTag(editingTag.id, { name: newTagName.trim(), color: newTagColor });
    resetForm();
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
  };

  const handleDeleteTag = (id: string) => {
    if (confirm('确定要删除这个标签吗？相关衣物上的该标签也会被移除。')) {
      removeTag(id);
    }
  };

  const getColorClasses = (colorValue: string) => {
    const color = TAG_COLORS.find((c) => c.value === colorValue);
    return color || TAG_COLORS[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-soft-hover w-full max-w-lg overflow-hidden animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <h2 className="text-lg font-serif font-semibold text-earth-800 flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            标签管理
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-earth-50 text-earth-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-earth-700 mb-3">
              {editingTag ? '编辑标签' : '新建标签'}
            </h3>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="输入标签名称，如：最爱"
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (editingTag ? handleUpdateTag() : handleAddTag())}
              />
              {editingTag ? (
                <button
                  onClick={handleUpdateTag}
                  disabled={!newTagName.trim()}
                  className="btn-primary px-4 disabled:opacity-50"
                >
                  保存
                </button>
              ) : (
                <button
                  onClick={handleAddTag}
                  disabled={!newTagName.trim()}
                  className="btn-primary px-4 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
            <div>
              <p className="text-xs text-earth-500 mb-2">选择颜色</p>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all duration-200',
                      color.bg,
                      newTagColor === color.value
                        ? 'border-earth-700 scale-110'
                        : 'border-transparent hover:scale-105'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-earth-700 mb-3">
              已有标签 ({tags.length})
            </h3>
            {tags.length === 0 ? (
              <div className="text-center py-8 text-earth-400">
                <TagIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>还没有标签，创建一个吧</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => {
                  const colorClasses = getColorClasses(tag.color);
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-earth-50 hover:bg-earth-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            colorClasses.bg,
                            colorClasses.text
                          )}
                        >
                          {tag.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditTag(tag)}
                          className="p-1.5 rounded-lg hover:bg-white text-earth-500 hover:text-earth-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1.5 rounded-lg hover:bg-white text-earth-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-earth-100">
          {editingTag && (
            <button
              onClick={resetForm}
              className="w-full btn-secondary mb-3"
            >
              取消编辑
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="w-full btn-primary"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
