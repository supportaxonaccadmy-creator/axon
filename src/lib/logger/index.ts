import type { LogLevel } from '@/types/configuration';
import { environmentConfig, runtimeConfig } from '@/config/runtime';

export interface LoggerEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

export type LoggerTransport = (entry: LoggerEntry) => void;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 99,
};

const CONSOLE_METHODS: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  none: 'debug',
};

class LoggerService {
  private level: LogLevel;
  private transports: LoggerTransport[];
  private isProduction: boolean;

  constructor(level: LogLevel = 'debug', isProduction = false) {
    this.level = level;
    this.isProduction = isProduction;
    this.transports = [this.consoleTransport];
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addTransport(transport: LoggerTransport): void {
    this.transports.push(transport);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level === 'none') return;
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.level]) return;
    if (this.isProduction && level === 'debug') return;

    const entry: LoggerEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    for (const transport of this.transports) {
      transport(entry);
    }
  }

  private consoleTransport = (entry: LoggerEntry): void => {
    const method = CONSOLE_METHODS[entry.level];
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;

    if (entry.data !== undefined) {
      console[method](prefix, entry.message, entry.data);
    } else {
      console[method](prefix, entry.message);
    }
  };
}

export const logger = new LoggerService(
  runtimeConfig.logLevel,
  environmentConfig.isProd,
);

export { LoggerService };
