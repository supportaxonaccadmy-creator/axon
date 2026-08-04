const HTML_ENTITY_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
const DANGEROUS_PATTERNS = [/<script[^>]*>[\s\S]*?<\/script>/gi, /<iframe[^>]*>[\s\S]*?<\/iframe>/gi, /<object[^>]*>[\s\S]*?<\/object>/gi, /<embed[^>]*>/gi, /javascript:/gi, /on\w+\s*=/gi, /data:text\/html/gi, /vbscript:/gi];

class InputSanitizer {
  sanitizeHTML(input: string): string { let result = input; for (const pattern of DANGEROUS_PATTERNS) { result = result.replace(pattern, ''); } return result; }
  escapeHTML(input: string): string { return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITY_MAP[char] ?? char); }
  sanitizeText(input: string): string { return this.escapeHTML(input.trim()); }
  sanitizeInput(input: string, maxLength: number = 1000): string { const trimmed = input.trim().slice(0, maxLength); return this.escapeHTML(trimmed); }
  sanitizeEmail(email: string): string { const cleaned = email.trim().toLowerCase().slice(0, 254); const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/; return emailRegex.test(cleaned) ? cleaned : ''; }
  sanitizeFilename(filename: string): string { const cleaned = filename.trim().slice(0, 255); return cleaned.replace(/[^a-zA-Z0-9._-]/g, '_'); }
  sanitizeURL(url: string): string { try { const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) return ''; return parsed.toString(); } catch { return ''; } }
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T { const result: Record<string, unknown> = {}; for (const [key, value] of Object.entries(obj)) { if (typeof value === 'string') { result[key] = this.sanitizeInput(value); } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) { result[key] = this.sanitizeObject(value as Record<string, unknown>); } else { result[key] = value; } } return result as T; }
  containsXSS(input: string): boolean { return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input)); }
  validateAndSanitizeForm<T extends Record<string, unknown>>(formData: T, rules: Partial<Record<keyof T, { maxLength?: number; required?: boolean }>>): { data: T; errors: Record<string, string> } { const errors: Record<string, string> = {}; const data: Record<string, unknown> = {}; for (const [key, value] of Object.entries(formData)) { const rule = rules[key as keyof T]; if (rule?.required && (!value || (typeof value === 'string' && !value.trim()))) { errors[key] = `${key} is required`; continue; } if (typeof value === 'string') { data[key] = this.sanitizeInput(value, rule?.maxLength ?? 1000); } else { data[key] = value; } } return { data: data as T, errors }; }
}

export const inputSanitizer = new InputSanitizer();
