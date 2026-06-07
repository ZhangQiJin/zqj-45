import { logger } from './logger';
import { PerformanceMetrics } from './types';

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  init() {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    this.collectNavigationTiming();
    this.observePaintMetrics();
    this.observeLCP();
    this.observeCLS();
    this.observeFID();

    window.addEventListener('load', () => {
      setTimeout(() => {
        this.reportMetrics();
      }, 0);
    });
  }

  private collectNavigationTiming() {
    if (performance.timing) {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;

      if (timing.domContentLoadedEventEnd > 0) {
        this.metrics.tti = timing.domContentLoadedEventEnd - navigationStart;
      }
    }
  }

  private observePaintMetrics() {
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            this.metrics.fp = entry.startTime;
            logger.info('Performance', 'First Paint (FP)', { value: `${entry.startTime.toFixed(2)}ms` });
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            logger.info('Performance', 'First Contentful Paint (FCP)', { value: `${entry.startTime.toFixed(2)}ms` });
          }
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (e) {
      logger.debug('Performance', 'Paint PerformanceObserver not supported');
    }
  }

  private observeLCP() {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime;
          logger.info('Performance', 'Largest Contentful Paint (LCP)', { value: `${lastEntry.startTime.toFixed(2)}ms` });
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      logger.debug('Performance', 'LCP PerformanceObserver not supported');
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        logger.info('Performance', 'Cumulative Layout Shift (CLS)', { value: clsValue.toFixed(4) });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      logger.debug('Performance', 'CLS PerformanceObserver not supported');
    }
  }

  private observeFID() {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEntry & { processingStart: number };
          const fid = fidEntry.processingStart - entry.startTime;
          this.metrics.fid = fid;
          logger.info('Performance', 'First Input Delay (FID)', { value: `${fid.toFixed(2)}ms` });
        }
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      logger.debug('Performance', 'FID PerformanceObserver not supported');
    }
  }

  mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
      this.marks.set(name, performance.now());
      logger.debug('Performance', `Mark: ${name}`);
    }
  }

  measure(name: string, startMark?: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      try {
        if (startMark && endMark) {
          performance.measure(name, startMark, endMark);
        } else if (startMark) {
          performance.measure(name, startMark);
        } else {
          performance.measure(name);
        }

        const entries = performance.getEntriesByName(name, 'measure');
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.measures.set(name, lastEntry.duration);
          logger.info('Performance', `Measure: ${name}`, { duration: `${lastEntry.duration.toFixed(2)}ms` });
          return lastEntry.duration;
        }
      } catch (e) {
        logger.warn('Performance', `Failed to measure ${name}`, { error: (e as Error).message });
      }
    }
    return 0;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getMeasures(): Map<string, number> {
    return new Map(this.measures);
  }

  reportMetrics() {
    logger.info('Performance', '性能指标汇总', this.metrics as unknown as Record<string, unknown>);
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
