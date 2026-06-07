import { LogLevel, LogEntry, MonitoringConfig, DEFAULT_CONFIG } from './types';

class Logger {
  private config: MonitoringConfig;
  private logs: LogEntry[] = [];
  private listeners: ((log: LogEntry) => void)[] = [];

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setConfig(config: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.config.logLevel);
  }

  private addLog(level: LogLevel, category: string, message: string, data?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const log: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(log);

    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(-this.config.maxLogs);
    }

    this.listeners.forEach((listener) => listener(log));
    this.printLog(log);
  }

  private printLog(log: LogEntry) {
    const timestamp = new Date(log.timestamp).toISOString();
    const prefix = `[${timestamp}] [${log.level.toUpperCase()}] [${log.category}]`;

    switch (log.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, log.message, log.data ?? '');
        break;
      case LogLevel.INFO:
        console.info(prefix, log.message, log.data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, log.message, log.data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, log.message, log.data ?? '');
        break;
    }
  }

  debug(category: string, message: string, data?: Record<string, unknown>) {
    this.addLog(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: Record<string, unknown>) {
    this.addLog(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: Record<string, unknown>) {
    this.addLog(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: Record<string, unknown>) {
    this.addLog(LogLevel.ERROR, category, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  subscribe(listener: (log: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
