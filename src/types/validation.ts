export type ValidationErrorCode =
  | 'required'
  | 'invalid_type'
  | 'invalid_email'
  | 'invalid_phone'
  | 'invalid_uuid'
  | 'invalid_slug'
  | 'invalid_url'
  | 'invalid_integer'
  | 'invalid_decimal'
  | 'invalid_boolean'
  | 'invalid_enum'
  | 'min_value'
  | 'max_value'
  | 'min_length'
  | 'max_length'
  | 'regex_mismatch'
  | 'reserved_word';

export interface FieldError {
  field: string;
  code: ValidationErrorCode;
  message: string;
  value: unknown;
}

export interface ValidationReport {
  valid: boolean;
  errors: FieldError[];
  fieldErrors: Record<string, string>;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'email'
  | 'phone'
  | 'uuid'
  | 'slug'
  | 'url'
  | 'enum'
  | 'decimal';

export interface FieldRule {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  enumValues?: readonly string[];
  label?: string;
}

export type ValidationSchema = Record<string, FieldRule> ;
