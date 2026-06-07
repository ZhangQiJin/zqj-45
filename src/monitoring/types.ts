export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}

export interface PerformanceMetrics {
  fp?: number;
  fcp?: number;
  lcp?: number;
  tti?: number;
  fid?: number;
  cls?: number;
}

export interface StateChangeLog {
  timestamp: number;
  storeName: string;
  action: string;
  prevState: Record<string, unknown>;
  nextState: Record<string, unknown>;
  duration?: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  logLevel: LogLevel;
  maxLogs: number;
  enableStateLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorBoundary: boolean;
}

export const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  logLevel: LogLevel.INFO,
  maxLogs: 1000,
  enableStateLogging: true,
  enablePerformanceMonitoring: true,
  enableErrorBoundary: true,
};
