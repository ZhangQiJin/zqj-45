import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { logger } from './logger';
import { StateChangeLog } from './types';

interface StateLoggerOptions {
  storeName: string;
  enabled?: boolean;
  diff?: boolean;
  collapsed?: boolean;
}

type StateLogger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs>,
  options: StateLoggerOptions
) => StateCreator<T, Mps, Mcs>;

const stateHistory: StateChangeLog[] = [];
const MAX_HISTORY = 200;

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const diffObjects = (
  prevObj: Record<string, unknown>,
  nextObj: Record<string, unknown>
): Record<string, { prev: unknown; next: unknown }> => {
  const diff: Record<string, { prev: unknown; next: unknown }> = {};
  const allKeys = new Set([...Object.keys(prevObj), ...Object.keys(nextObj)]);

  allKeys.forEach((key) => {
    const prevValue = prevObj[key];
    const nextValue = nextObj[key];

    if (prevValue !== nextValue) {
      if (isObject(prevValue) && isObject(nextValue)) {
        const nestedDiff = diffObjects(prevValue, nextValue);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = { prev: prevValue, next: nextValue };
        }
      } else {
        diff[key] = { prev: prevValue, next: nextValue };
      }
    }
  });

  return diff;
};

const sanitizeState = (state: unknown): Record<string, unknown> => {
  if (!isObject(state)) return {};

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === 'function') {
      continue;
    }
    if (Array.isArray(value)) {
      sanitized[key] = `[Array(${value.length})]`;
    } else if (isObject(value)) {
      const keys = Object.keys(value);
      sanitized[key] = `{Object: ${keys.length} keys}`;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const stateLogger: StateLogger =
  (config, options) => (set, get, api) => {
    const { storeName, enabled = true, diff = true } = options;

    if (!enabled) {
      return config(set, get, api);
    }

    const loggedSet: typeof set = ((state: any, replace?: boolean) => {
      const startTime = performance.now();
      const prevState = sanitizeState(get() as Record<string, unknown>);

      (set as any)(state, replace);

      const endTime = performance.now();
      const duration = endTime - startTime;
      const nextState = sanitizeState(get() as Record<string, unknown>);

      let actionName = 'anonymous';
      try {
        const stack = new Error().stack;
        if (stack) {
          const lines = stack.split('\n');
          for (let i = 2; i < lines.length; i++) {
            const match = lines[i].match(/at\s+(\w+)\s*\(/);
            if (match && !['loggedSet', 'set', 'anonymous'].includes(match[1])) {
              actionName = match[1];
              break;
            }
          }
        }
      } catch (e) {}

      const stateDiff = diff ? diffObjects(prevState, nextState) : {};
      const hasChanges = Object.keys(stateDiff).length > 0;

      if (hasChanges || actionName !== 'anonymous') {
        const logEntry: StateChangeLog = {
          timestamp: Date.now(),
          storeName,
          action: actionName,
          prevState,
          nextState,
          duration,
        };

        stateHistory.push(logEntry);
        if (stateHistory.length > MAX_HISTORY) {
          stateHistory.shift();
        }

        logger.debug('State', `[${storeName}] ${actionName}`, {
          changes: stateDiff,
          duration: `${duration.toFixed(2)}ms`,
        });
      }
    }) as typeof set;

    return config(loggedSet, get, api);
  };

export const getStateHistory = (): StateChangeLog[] => {
  return [...stateHistory];
};

export const clearStateHistory = () => {
  stateHistory.length = 0;
};

export const getStateHistoryByStore = (storeName: string): StateChangeLog[] => {
  return stateHistory.filter((log) => log.storeName === storeName);
};
