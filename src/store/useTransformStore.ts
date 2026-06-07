import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserTransform, TransformCategory, TransformExecution } from '@/types';
import { generateId } from '@/utils/image';

interface TransformState {
  userTransforms: UserTransform[];
  likedTransformIds: string[];
  favoritedTransformIds: string[];
  transformExecutions: TransformExecution[];

  addUserTransform: (transform: Omit<UserTransform, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'isFavorited' | 'isUserCreated'> & { category: TransformCategory }) => void;
  removeUserTransform: (id: string) => void;
  toggleLikeTransform: (transformId: string) => void;
  toggleFavoriteTransform: (transformId: string) => void;
  isTransformLiked: (transformId: string) => boolean;
  isTransformFavorited: (transformId: string) => boolean;
  getTransformLikes: (transformId: string) => number;

  startTransformExecution: (transformId: string, totalSteps: number) => void;
  updateStepProgress: (transformId: string, stepIndex: number, completed: boolean, note?: string) => void;
  getTransformExecution: (transformId: string) => TransformExecution | undefined;
  getTransformProgress: (transformId: string) => number;
  isTransformCompleted: (transformId: string) => boolean;
  removeTransformExecution: (transformId: string) => void;
}

export const useTransformStore = create<TransformState>()(
  persist(
    (set, get) => ({
      userTransforms: [],
      likedTransformIds: [],
      favoritedTransformIds: [],
      transformExecutions: [],

      addUserTransform: (transform) => {
        set((state) => ({
          userTransforms: [
            ...state.userTransforms,
            {
              ...transform,
              id: generateId(),
              createdAt: Date.now(),
              likes: 0,
              isLiked: false,
              isFavorited: false,
              isUserCreated: true,
            } as UserTransform,
          ],
        }));
      },

      removeUserTransform: (id) => {
        set((state) => ({
          userTransforms: state.userTransforms.filter((t) => t.id !== id),
          likedTransformIds: state.likedTransformIds.filter((tid) => tid !== id),
          favoritedTransformIds: state.favoritedTransformIds.filter((tid) => tid !== id),
        }));
      },

      toggleLikeTransform: (transformId) => {
        set((state) => {
          const isLiked = state.likedTransformIds.includes(transformId);
          const newLikedIds = isLiked
            ? state.likedTransformIds.filter((id) => id !== transformId)
            : [...state.likedTransformIds, transformId];

          const updatedTransforms = state.userTransforms.map((t) =>
            t.id === transformId
              ? { ...t, isLiked: !isLiked, likes: isLiked ? t.likes - 1 : t.likes + 1 }
              : t
          );

          return {
            likedTransformIds: newLikedIds,
            userTransforms: updatedTransforms,
          };
        });
      },

      toggleFavoriteTransform: (transformId) => {
        set((state) => {
          const isFavorited = state.favoritedTransformIds.includes(transformId);
          const newFavoritedIds = isFavorited
            ? state.favoritedTransformIds.filter((id) => id !== transformId)
            : [...state.favoritedTransformIds, transformId];

          const updatedTransforms = state.userTransforms.map((t) =>
            t.id === transformId
              ? { ...t, isFavorited: !isFavorited }
              : t
          );

          return {
            favoritedTransformIds: newFavoritedIds,
            userTransforms: updatedTransforms,
          };
        });
      },

      isTransformLiked: (transformId) => {
        return get().likedTransformIds.includes(transformId);
      },

      isTransformFavorited: (transformId) => {
        return get().favoritedTransformIds.includes(transformId);
      },

      getTransformLikes: (transformId) => {
        const transform = get().userTransforms.find((t) => t.id === transformId);
        return transform?.likes || 0;
      },

      startTransformExecution: (transformId, totalSteps) => {
        set((state) => {
          const existing = state.transformExecutions.find((e) => e.transformId === transformId);
          if (existing) return state;

          const stepProgress = Array.from({ length: totalSteps }, (_, i) => ({
            stepIndex: i,
            completed: false,
          }));

          return {
            transformExecutions: [
              ...state.transformExecutions,
              {
                transformId,
                stepProgress,
                startedAt: Date.now(),
              },
            ],
          };
        });
      },

      updateStepProgress: (transformId, stepIndex, completed, note) => {
        set((state) => {
          const updatedExecutions = state.transformExecutions.map((execution) => {
            if (execution.transformId !== transformId) return execution;

            const updatedStepProgress = execution.stepProgress.map((step) => {
              if (step.stepIndex !== stepIndex) return step;
              return {
                ...step,
                completed,
                note: note !== undefined ? note : step.note,
                completedAt: completed ? Date.now() : undefined,
              };
            });

            const allCompleted = updatedStepProgress.every((step) => step.completed);

            return {
              ...execution,
              stepProgress: updatedStepProgress,
              completedAt: allCompleted ? Date.now() : undefined,
            };
          });

          return { transformExecutions: updatedExecutions };
        });
      },

      getTransformExecution: (transformId) => {
        return get().transformExecutions.find((e) => e.transformId === transformId);
      },

      getTransformProgress: (transformId) => {
        const execution = get().transformExecutions.find((e) => e.transformId === transformId);
        if (!execution || execution.stepProgress.length === 0) return 0;
        const completedSteps = execution.stepProgress.filter((step) => step.completed).length;
        return (completedSteps / execution.stepProgress.length) * 100;
      },

      isTransformCompleted: (transformId) => {
        const execution = get().transformExecutions.find((e) => e.transformId === transformId);
        if (!execution) return false;
        return execution.stepProgress.every((step) => step.completed);
      },

      removeTransformExecution: (transformId) => {
        set((state) => ({
          transformExecutions: state.transformExecutions.filter((e) => e.transformId !== transformId),
        }));
      },
    }),
    {
      name: 'transform-storage',
      partialize: (state) => ({
        userTransforms: state.userTransforms,
        likedTransformIds: state.likedTransformIds,
        favoritedTransformIds: state.favoritedTransformIds,
        transformExecutions: state.transformExecutions,
      }),
    }
  )
);
