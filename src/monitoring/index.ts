export * from './types';
export * from './logger';
export * from './ErrorBoundary';
export * from './performance';
export * from './stateLogger';

import { logger } from './logger';
import { performanceMonitor } from './performance';
import { MonitoringConfig } from './types';

export const initMonitoring = (config?: Partial<MonitoringConfig>) => {
  if (config) {
    logger.setConfig(config);
  }

  if (config?.enablePerformanceMonitoring ?? true) {
    performanceMonitor.init();
  }

  window.addEventListener('error', (event) => {
    logger.error('GlobalError', '未捕获的异常', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('GlobalError', '未处理的 Promise 拒绝', {
      reason: String(event.reason),
      stack: event.reason instanceof Error ? event.reason.stack : undefined,
    });
  });

  logger.info('Monitoring', '监控系统已初始化');
};
