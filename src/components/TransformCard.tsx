import { useState, useEffect } from 'react';
import { Star, ChevronRight, ArrowRight, X, Heart, Bookmark, User, Play, CheckCircle2 } from 'lucide-react';
import { TransformTemplate, TRANSFORM_CATEGORY_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import TransformExecutionModal from './TransformExecutionModal';

interface TransformCardProps {
  template: TransformTemplate;
}

export default function TransformCard({ template }: TransformCardProps) {
  const [showSteps, setShowSteps] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [beforeImageError, setBeforeImageError] = useState(false);
  const [afterImageError, setAfterImageError] = useState(false);

  const toggleLikeTransform = useStore((state) => state.toggleLikeTransform);
  const toggleFavoriteTransform = useStore((state) => state.toggleFavoriteTransform);
  const likedTransformIds = useStore((state) => state.likedTransformIds);
  const favoritedTransformIds = useStore((state) => state.favoritedTransformIds);
  const transformExecutions = useStore((state) => state.transformExecutions);
  const userTransforms = useStore((state) => state.userTransforms);

  const isLiked = template.isUserCreated ? likedTransformIds.includes(template.id) : false;
  const isFavorited = favoritedTransformIds.includes(template.id);
  const userTransform = template.isUserCreated ? userTransforms.find((t) => t.id === template.id) : undefined;
  const likeCount = userTransform ? userTransform.likes : (template.likes || 0);
  const execution = transformExecutions.find((e) => e.transformId === template.id);
  const hasStarted = !!execution;
  const progress = execution && execution.stepProgress.length > 0
    ? (execution.stepProgress.filter((s) => s.completed).length / execution.stepProgress.length) * 100
    : 0;
  const isCompleted = execution ? execution.stepProgress.every((s) => s.completed) : false;

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
        className="card relative overflow-hidden"
      >
        {isCompleted && (
          <div className="absolute top-3 right-3 z-10 bg-sage-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            已完成
          </div>
        )}

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

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={cn('tag text-xs', categoryColors[template.category])}>
              {TRANSFORM_CATEGORY_LABELS[template.category]}
            </span>
            {isFavorited && (
              <span className="tag text-xs bg-amber-100 text-amber-700 flex items-center gap-1">
                <Bookmark className="w-3 h-3 fill-amber-500" />
              </span>
            )}
          </div>
        </div>

        {hasStarted && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between text-xs text-earth-500 mb-1.5">
              <span>执行进度</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-earth-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 rounded-full',
                  isCompleted ? 'bg-sage-500' : 'bg-terracotta-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

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
            <div className="flex items-center gap-2">
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
              <button
                className={cn(
                  'flex items-center gap-1 text-sm font-medium transition-colors',
                  hasStarted
                    ? 'text-terracotta-600 hover:text-terracotta-700'
                    : 'text-earth-500 hover:text-terracotta-600'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExecution(true);
                }}
              >
                <Play className="w-4 h-4" />
                {hasStarted ? (isCompleted ? '查看记录' : '继续执行') : '开始执行'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {template.isUserCreated && (
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
              )}
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

      <TransformExecutionModal
        template={template}
        isOpen={showExecution}
        onClose={() => setShowExecution(false)}
      />
    </>
  );
}
