import { BaseService } from '../base/BaseService';
import { logger } from '@/lib/logger';
import type { LoggerTransport } from '@/lib/logger';

export class LoggerServiceWrapper extends BaseService {
  debug(message: string, data?: unknown): void {
    logger.debug(message, data);
  }

  info(message: string, data?: unknown): void {
    logger.info(message, data);
  }

  warn(message: string, data?: unknown): void {
    logger.warn(message, data);
  }

  error(message: string, data?: unknown): void {
    logger.error(message, data);
  }

  addTransport(transport: LoggerTransport): void {
    logger.addTransport(transport);
  }
}

export const loggerService = new LoggerServiceWrapper();
