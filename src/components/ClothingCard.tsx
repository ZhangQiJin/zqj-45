import { useState } from 'react';
import { Trash2, GripVertical, Tag as TagIcon } from 'lucide-react';
import { ClothingItem, CATEGORY_LABELS, TAG_COLORS } from '@/types';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface ClothingCardProps {
  item: ClothingItem;
  showDelete?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, item: ClothingItem) => void;
  onClick?: () => void;
  onTagClick?: () => void;
  className?: string;
}

export default function ClothingCard({
  item,
  showDelete = true,
  draggable = false,
  onDragStart,
  onClick,
  onTagClick,
  className,
}: ClothingCardProps) {
  const [imageError, setImageError] = useState(false);
  const removeClothingItem = useStore((state) => state.removeClothingItem);
  const getClothingTags = useStore((state) => state.getClothingTags);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这件衣物吗？')) {
      removeClothingItem(item.id);
    }
  };

  const tags = getClothingTags(item.id);

  const getColorClasses = (colorValue: string) => {
    const color = TAG_COLORS.find((c) => c.value === colorValue);
    return color || TAG_COLORS[0];
  };

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTagClick?.();
  };

  return (
    <div
      className={cn(
        'card group relative overflow-hidden',
        draggable && 'cursor-grab active:cursor-grabbing',
        onClick && 'cursor-pointer',
        className
      )}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, item)}
      onClick={onClick}
    >
      <div className="aspect-square bg-earth-50 relative overflow-hidden">
        {!imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-earth-400">
            <span className="text-4xl">👕</span>
          </div>
        )}

        {showDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-earth-500 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {draggable && (
          <div className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-earth-400 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <GripVertical className="w-3 h-3" />
          </div>
        )}

        {onTagClick && (
          <button
            onClick={handleTagClick}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-earth-500 hover:text-sage-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="编辑标签"
          >
            <TagIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-earth-800 truncate">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-sage-50 text-sage-600">
            {CATEGORY_LABELS[item.category]}
          </span>
          <span className="text-xs text-earth-500">{item.color}</span>
        </div>
        {tags.length > 0 && (
          <div
            className="flex flex-wrap gap-1 mt-2 cursor-pointer"
            onClick={handleTagClick}
          >
            {tags.slice(0, 3).map((tag) => {
              const colorClasses = getColorClasses(tag.color);
              return (
                <span
                  key={tag.id}
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    colorClasses.bg,
                    colorClasses.text
                  )}
                >
                  {tag.name}
                </span>
              );
            })}
            {tags.length > 3 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-earth-100 text-earth-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
