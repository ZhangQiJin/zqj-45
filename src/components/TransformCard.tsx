import { useState, useEffect } from 'react';
import { Star, ChevronRight, ArrowRight, X, Heart, Bookmark, User } from 'lucide-react';
import { TransformTemplate, TRANSFORM_CATEGORY_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface TransformCardProps {
  template: TransformTemplate;
}

export default function TransformCard({ template }: TransformCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [beforeImageError, setBeforeImageError] = useState(false);
  const [afterImageError, setAfterImageError] = useState(false);

  const toggleLikeTransform = useStore((state) => state.toggleLikeTransform);
  const toggleFavoriteTransform = useStore((state) => state.toggleFavoriteTransform);
  const isTransformLiked = useStore((state) => state.isTransformLiked);
  const isTransformFavorited = useStore((state) => state.isTransformFavorited);
  const getTransformLikes = useStore((state) => state.getTransformLikes);

  const isLiked = template.isUserCreated ? isTransformLiked(template.id) : false;
  const isFavorited = template.isUserCreated ? isTransformFavorited(template.id) : false;
  const likeCount = template.isUserCreated ? getTransformLikes(template.id) : (template.likes || 0);

  useEffect(() => {
    if (!showSteps) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSteps(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSteps]);

  const categoryColors: Record<string, string> = {
    cut: 'bg-terracotta-100 text-terracotta-700',
    dye: 'bg-sage-100 text-sage-700',
    patchwork: 'bg-earth-200 text-earth-700',
    decorate: 'bg-terracotta-50 text-terracotta-600',
  };

  return (
    <>
      <div
        className="card cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative">
          <div className="grid grid-cols-2 gap-0.5 bg-earth-100">
            <div className="aspect-square bg-earth-50 relative overflow-hidden">
              {!beforeImageError ? (
                <img
                  src={template.beforeImage}
                  alt="改造前"
                  className="w-full h-full object-cover"
                  onError={() => setBeforeImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth-400">
                  <span className="text-3xl">👕</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/50 text-white">
                改造前
              </span>
            </div>
            <div className="aspect-square bg-earth-50 relative overflow-hidden">
              {!afterImageError ? (
                <img
                  src={template.afterImage}
                  alt="改造后"
                  className="w-full h-full object-cover"
                  onError={() => setAfterImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-earth-400">
                  <span className="text-3xl">✨</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-sage-500 text-white">
                改造后
              </span>
              <ArrowRight className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 text-white drop-shadow-md" />
            </div>
          </div>

          <div className="absolute top-3 left-3">
            <span className={cn('tag text-xs', categoryColors[template.category])}>
              {TRANSFORM_CATEGORY_LABELS[template.category]}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-earth-800 line-clamp-1">{template.title}</h3>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    i < template.difficulty
                      ? 'text-terracotta-400 fill-terracotta-400'
                      : 'text-earth-200'
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-earth-500 mt-1.5 line-clamp-2">{template.description}</p>

          {template.isUserCreated && template.authorName && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-earth-400">
              <User className="w-3.5 h-3.5" />
              <span>{template.authorName}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              className="flex items-center gap-1 text-sm text-sage-600 font-medium hover:text-sage-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowSteps(true);
              }}
            >
              查看步骤
              <ChevronRight className="w-4 h-4" />
            </button>

            {template.isUserCreated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLikeTransform(template.id);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors flex items-center gap-1',
                    isLiked
                      ? 'text-terracotta-500 bg-terracotta-50'
                      : 'text-earth-400 hover:text-terracotta-500 hover:bg-terracotta-50'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isLiked ? 'fill-terracotta-500' : '')} />
                  <span className="text-xs">{likeCount}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteTransform(template.id);
                  }}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isFavorited
                      ? 'text-amber-500 bg-amber-50'
                      : 'text-earth-400 hover:text-amber-500 hover:bg-amber-50'
                  )}
                >
                  <Bookmark className={cn('w-4 h-4', isFavorited ? 'fill-amber-500' : '')} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSteps && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSteps(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-soft-hover w-full max-w-lg overflow-hidden animate-slide-up max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-earth-100">
              <h3 className="text-lg font-serif font-semibold text-earth-800">
                {template.title}
              </h3>
              <button
                onClick={() => setShowSteps(false)}
                className="p-2 rounded-lg hover:bg-earth-50 text-earth-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="aspect-square rounded-xl overflow-hidden bg-earth-50">
                  {!beforeImageError ? (
                    <img
                      src={template.beforeImage}
                      alt="改造前"
                      className="w-full h-full object-cover"
                      onError={() => setBeforeImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-earth-400">
                      <span className="text-4xl">👕</span>
                    </div>
                  )}
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-earth-50">
                  {!afterImageError ? (
                    <img
                      src={template.afterImage}
                      alt="改造后"
                      className="w-full h-full object-cover"
                      onError={() => setAfterImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-earth-400">
                      <span className="text-4xl">✨</span>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-medium text-earth-800 mb-3">改造步骤</h4>
              <div className="space-y-3">
                {template.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-earth-600 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
