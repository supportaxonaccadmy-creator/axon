import { BaseService } from '../base/BaseService';
import type { ApiRequestConfig, ApiResponse, ApiResult } from '@/types/api';
import { API_CONSTANTS } from '@/constants/api';
import { ApiError } from '@/errors/ApiError';
import { isApiError } from '@/types/api';

export class ApiService extends BaseService {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string = '', timeout: number = API_CONSTANTS.DEFAULT_TIMEOUT) {
    super();
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  async request<T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const url = config.url.startsWith('http') ? config.url : `${this.baseUrl}${config.url}`;
    const method = config.method ?? 'GET';
    const timeout = config.timeout ?? this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const init: RequestInit = {
        method,
        headers: { ...API_CONSTANTS.DEFAULT_HEADERS, ...config.headers },
        signal: config.signal ?? controller.signal,
      };
      if (config.body !== undefined) {
        init.body = JSON.stringify(config.body);
      }
      const response = await fetch(url, init);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(`Request failed with status ${response.status}`, {
          status: response.status,
          code: 'API_ERROR',
        });
      }

      const data = (await response.json()) as T;
      return { data, success: true };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if (error instanceof Error) {
        throw new ApiError(error.message, { code: 'NETWORK_ERROR', cause: error });
      }
      throw new ApiError('Request failed');
    }
  }

  async get<T = unknown>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T = unknown>(url: string, body?: unknown, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  async put<T = unknown>(url: string, body?: unknown, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  async patch<T = unknown>(url: string, body?: unknown, config?: Omit<ApiRequestConfig, 'url' | 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  async delete<T = unknown>(url: string, config?: Omit<ApiRequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  async safeRequest<T = unknown>(config: ApiRequestConfig): Promise<ApiResult<T>> {
    try {
      return await this.request<T>(config);
    } catch (error) {
      if (isApiError(error)) return error;
      return this.wrapError(error).error;
    }
  }
}
