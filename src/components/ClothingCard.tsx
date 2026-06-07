import { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { ClothingItem, CATEGORY_LABELS } from '@/types';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface ClothingCardProps {
  item: ClothingItem;
  showDelete?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, item: ClothingItem) => void;
  onClick?: () => void;
  className?: string;
}

export default function ClothingCard({
  item,
  showDelete = true,
  draggable = false,
  onDragStart,
  onClick,
  className,
}: ClothingCardProps) {
  const [imageError, setImageError] = useState(false);
  const removeClothingItem = useStore((state) => state.removeClothingItem);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这件衣物吗？')) {
      removeClothingItem(item.id);
    }
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
      </div>

      <div className="p-3">
        <h3 className="font-medium text-earth-800 truncate">{item.name}</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-sage-50 text-sage-600">
            {CATEGORY_LABELS[item.category]}
          </span>
          <span className="text-xs text-earth-500">{item.color}</span>
        </div>
      </div>
    </div>
  );
}
