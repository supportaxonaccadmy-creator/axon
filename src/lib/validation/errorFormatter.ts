import type { FieldError, ValidationReport } from '@/types/validation';

export function formatError(error: FieldError): string {
  return error.message;
}

export function formatErrors(errors: FieldError[]): string[] {
  return errors.map((e) => e.message);
}

export function formatFieldErrors(report: ValidationReport): Record<string, string> {
  return report.fieldErrors;
}

export function formatReport(report: ValidationReport): string {
  if (report.valid) return 'Validation passed';
  return report.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
}

export function toErrorList(report: ValidationReport): string[] {
  return report.errors.map((e) => e.message);
}

export function toFieldErrorMap(report: ValidationReport): Record<string, string> {
  const map: Record<string, string> = {};
  for (const e of report.errors) {
    map[e.field] = e.message;
  }
  return map;
}
