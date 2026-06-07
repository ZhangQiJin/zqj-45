import { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, ChevronRight, RotateCcw } from 'lucide-react';
import { TransformTemplate } from '@/types';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

interface TransformExecutionModalProps {
  template: TransformTemplate;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransformExecutionModal({ template, isOpen, onClose }: TransformExecutionModalProps) {
  const transformExecutions = useStore((state) => state.transformExecutions);
  const startTransformExecution = useStore((state) => state.startTransformExecution);
  const updateStepProgress = useStore((state) => state.updateStepProgress);
  const removeTransformExecution = useStore((state) => state.removeTransformExecution);

  const execution = transformExecutions.find((e) => e.transformId === template.id);
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (execution) {
      const notes: Record<number, string> = {};
      execution.stepProgress.forEach((step) => {
        if (step.note) notes[step.stepIndex] = step.note;
      });
      setStepNotes(notes);
    }
  }, [execution]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleStart = () => {
    startTransformExecution(template.id, template.steps.length);
  };

  const handleToggleStep = (stepIndex: number, completed: boolean) => {
    updateStepProgress(template.id, stepIndex, completed, stepNotes[stepIndex]);
  };

  const handleNoteChange = (stepIndex: number, note: string) => {
    setStepNotes((prev) => ({ ...prev, [stepIndex]: note }));
    if (execution) {
      updateStepProgress(template.id, stepIndex, execution.stepProgress[stepIndex]?.completed || false, note);
    }
  };

  const handleReset = () => {
    removeTransformExecution(template.id);
    setStepNotes({});
  };

  const progress = execution
    ? (execution.stepProgress.filter((s) => s.completed).length / execution.stepProgress.length) * 100
    : 0;

  const isCompleted = execution?.stepProgress.every((s) => s.completed) || false;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-soft-hover w-full max-w-2xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-earth-100">
          <div>
            <h3 className="text-lg font-serif font-semibold text-earth-800">
              {template.title}
            </h3>
            {execution && (
              <p className="text-sm text-earth-500 mt-0.5">
                {isCompleted ? '已完成 🎉' : `执行进度 ${Math.round(progress)}%`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {execution && (
              <button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-earth-50 text-earth-400 hover:text-earth-600 transition-colors"
                title="重置进度"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-earth-50 text-earth-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {execution && (
          <div className="px-5 pt-4">
            <div className="w-full h-2 bg-earth-100 rounded-full overflow-hidden">
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

        <div className="overflow-y-auto p-5 flex-1">
          {!execution ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <ChevronRight className="w-8 h-8 text-sage-600" />
              </div>
              <h4 className="font-medium text-earth-800 mb-2">开始执行这个改造方案？</h4>
              <p className="text-earth-500 text-sm mb-6 max-w-sm mx-auto">
                开始后，你可以逐步标记每一步的完成状态，记录操作心得。进度会自动保存。
              </p>
              <button
                onClick={handleStart}
                className="btn-primary"
              >
                开始执行
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {template.steps.map((step, index) => {
                const stepProgress = execution.stepProgress[index];
                const isStepCompleted = stepProgress?.completed || false;

                return (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-200',
                      isStepCompleted
                        ? 'bg-sage-50 border-sage-200'
                        : 'bg-white border-earth-100 hover:border-earth-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStep(index, !isStepCompleted)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isStepCompleted ? (
                          <CheckCircle className="w-5 h-5 text-sage-500 fill-sage-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-earth-300 hover:text-terracotta-400 transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-medium leading-relaxed',
                            isStepCompleted ? 'text-sage-700 line-through' : 'text-earth-700'
                          )}
                        >
                          <span className="inline-block w-6 h-6 rounded-full bg-earth-100 text-earth-500 text-xs text-center leading-6 mr-2">
                            {index + 1}
                          </span>
                          {step}
                        </p>

                        <div className="mt-3">
                          <textarea
                            value={stepNotes[index] || ''}
                            onChange={(e) => handleNoteChange(index, e.target.value)}
                            placeholder={isStepCompleted ? '记录完成心得...' : '记录这一步的操作心得或遇到的问题...'}
                            className={cn(
                              'w-full px-3 py-2 text-sm rounded-lg border resize-none transition-colors focus:outline-none focus:ring-2',
                              isStepCompleted
                                ? 'bg-white border-sage-200 focus:ring-sage-200'
                                : 'bg-earth-50 border-earth-200 focus:ring-terracotta-200'
                            )}
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {execution && (
          <div className="p-5 border-t border-earth-100 bg-earth-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-earth-500">
                共 {template.steps.length} 步，已完成 {execution.stepProgress.filter((s) => s.completed).length} 步
              </div>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
