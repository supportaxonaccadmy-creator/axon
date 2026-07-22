/**
 * Validation utility functions for common input types.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate a URL.
 */
export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Check if a string is empty or whitespace only.
 */
export function isEmpty(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Validate password strength. Returns true if the password meets
 * minimum requirements (8+ chars, at least one letter and one number).
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

/**
 * Validate that a string meets a minimum length.
 */
export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Validate that a string does not exceed a maximum length.
 */
export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validate a phone number (basic check: digits, spaces, +, -, parentheses).
 */
export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s()-]{7,}$/.test(phone);
}
