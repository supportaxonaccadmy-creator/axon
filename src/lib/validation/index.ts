import type { ValidationSchema, ValidationReport } from '@/types/validation';
import { schemaValidator } from './schemaValidator';

export { fieldValidator } from './fieldValidator';
export { schemaValidator } from './schemaValidator';
export {
  formatError,
  formatErrors,
  formatFieldErrors,
  formatReport,
  toErrorList,
  toFieldErrorMap,
} from './errorFormatter';

export const validationEngine = {
  validate(data: Record<string, unknown>, schema: ValidationSchema): ValidationReport {
    return schemaValidator.validate(data, schema);
  },

  validateField(field: string, value: unknown, schema: ValidationSchema): ValidationReport {
    const rule = schema[field];
    if (!rule) return { valid: true, errors: [], fieldErrors: {} };
    return schemaValidator.validate({ [field]: value }, { [field]: rule });
  },

  isValid(data: Record<string, unknown>, schema: ValidationSchema): boolean {
    return schemaValidator.validate(data, schema).valid;
  },

  getErrors(data: Record<string, unknown>, schema: ValidationSchema): string[] {
    return schemaValidator.validate(data, schema).errors.map((e) => e.message);
  },
};

export type { ValidationSchema, ValidationReport, FieldError, FieldRule, FieldType, ValidationErrorCode } from '@/types/validation';
