import type { ValidationErrorCode, FieldError } from '@/types/validation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{10,15}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_REGEX = /^https?:\/\/[^\s]+$/i;

export interface FieldValidatorResult {
  valid: boolean;
  error: FieldError | null;
}

function ok(): FieldValidatorResult {
  return { valid: true, error: null };
}

function err(field: string, code: ValidationErrorCode, message: string, value: unknown): FieldValidatorResult {
  return { valid: false, error: { field, code, message, value } };
}

export const fieldValidator = {
  required(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return err(field, 'required', `${l} is required`, value);
    if (typeof value === 'string' && value.trim().length === 0) return err(field, 'required', `${l} is required`, value);
    return ok();
  },

  email(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) return err(field, 'invalid_email', `${l} must be a valid email address`, value);
    return ok();
  },

  phone(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value !== 'string' || !PHONE_REGEX.test(value)) return err(field, 'invalid_phone', `${l} must be a valid phone number`, value);
    return ok();
  },

  uuid(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value !== 'string' || !UUID_REGEX.test(value)) return err(field, 'invalid_uuid', `${l} must be a valid UUID`, value);
    return ok();
  },

  slug(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value !== 'string' || !SLUG_REGEX.test(value)) return err(field, 'invalid_slug', `${l} must be a valid slug (lowercase alphanumeric with hyphens)`, value);
    return ok();
  },

  url(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value !== 'string' || !URL_REGEX.test(value)) return err(field, 'invalid_url', `${l} must be a valid URL`, value);
    return ok();
  },

  integer(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return ok();
    if (typeof value !== 'number' || !Number.isInteger(value)) return err(field, 'invalid_integer', `${l} must be an integer`, value);
    return ok();
  },

  decimal(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return ok();
    if (typeof value !== 'number' || isNaN(value)) return err(field, 'invalid_decimal', `${l} must be a decimal number`, value);
    return ok();
  },

  boolean(field: string, value: unknown, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return ok();
    if (typeof value !== 'boolean') return err(field, 'invalid_boolean', `${l} must be a boolean`, value);
    return ok();
  },

  enum(field: string, value: unknown, values: readonly string[], label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return ok();
    if (typeof value !== 'string' || !values.includes(value)) return err(field, 'invalid_enum', `${l} must be one of: ${values.join(', ')}`, value);
    return ok();
  },

  min(field: string, value: unknown, minVal: number, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return ok();
    if (typeof value === 'number' && value < minVal) return err(field, 'min_value', `${l} must be at least ${minVal}`, value);
    return ok();
  },

  max(field: string, value: unknown, maxVal: number, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null) return ok();
    if (typeof value === 'number' && value > maxVal) return err(field, 'max_value', `${l} must not exceed ${maxVal}`, value);
    return ok();
  },

  minLength(field: string, value: unknown, minLen: number, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value === 'string' && value.length < minLen) return err(field, 'min_length', `${l} must be at least ${minLen} characters`, value);
    return ok();
  },

  maxLength(field: string, value: unknown, maxLen: number, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value === 'string' && value.length > maxLen) return err(field, 'max_length', `${l} must not exceed ${maxLen} characters`, value);
    return ok();
  },

  regex(field: string, value: unknown, pattern: RegExp, label?: string): FieldValidatorResult {
    const l = label ?? field;
    if (value === undefined || value === null || value === '') return ok();
    if (typeof value !== 'string' || !pattern.test(value)) return err(field, 'regex_mismatch', `${l} has an invalid format`, value);
    return ok();
  },
};
