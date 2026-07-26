import type { ValidationSchema, ValidationReport, FieldError } from '@/types/validation';
import { fieldValidator } from './fieldValidator';

export const schemaValidator = {
  validate(data: Record<string, unknown>, schema: ValidationSchema): ValidationReport {
    const errors: FieldError[] = [];
    const fieldErrors: Record<string, string> = {};

    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = data[fieldName];
      const label = rule.label ?? fieldName;

      if (rule.required) {
        const result = fieldValidator.required(fieldName, value, label);
        if (!result.valid && result.error) {
          errors.push(result.error);
          fieldErrors[fieldName] = result.error.message;
          continue;
        }
      }

      if (value === undefined || value === null || value === '') continue;

      switch (rule.type) {
        case 'email': {
          const r = fieldValidator.email(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'phone': {
          const r = fieldValidator.phone(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'uuid': {
          const r = fieldValidator.uuid(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'slug': {
          const r = fieldValidator.slug(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'url': {
          const r = fieldValidator.url(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'integer': {
          const r = fieldValidator.integer(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'decimal': {
          const r = fieldValidator.decimal(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'boolean': {
          const r = fieldValidator.boolean(fieldName, value, label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'enum': {
          const r = fieldValidator.enum(fieldName, value, rule.enumValues ?? [], label);
          if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
          break;
        }
        case 'string':
        case 'number':
          break;
      }

      if (rule.min !== undefined) {
        const r = fieldValidator.min(fieldName, value, rule.min, label);
        if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
      }
      if (rule.max !== undefined) {
        const r = fieldValidator.max(fieldName, value, rule.max, label);
        if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
      }
      if (rule.minLength !== undefined) {
        const r = fieldValidator.minLength(fieldName, value, rule.minLength, label);
        if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
      }
      if (rule.maxLength !== undefined) {
        const r = fieldValidator.maxLength(fieldName, value, rule.maxLength, label);
        if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
      }
      if (rule.regex) {
        const r = fieldValidator.regex(fieldName, value, rule.regex, label);
        if (!r.valid && r.error) { errors.push(r.error); fieldErrors[fieldName] = r.error.message; }
      }
    }

    return { valid: errors.length === 0, errors, fieldErrors };
  },
};
