export type ErrorType =
  | 'application'
  | 'validation'
  | 'api'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'network'
  | 'timeout'
  | 'unknown';

export interface ErrorContext {
  [key: string]: unknown;
}

export interface SerializedError {
  type: ErrorType;
  message: string;
  code: string;
  status?: number | undefined;
  details?: unknown;
  context?: ErrorContext | undefined;
  timestamp: string;
  stack?: string | undefined;
}
