import { REGEX } from '@/constants/regex';
import { VALIDATION } from '@/constants/validation';

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  if (email.length > VALIDATION.EMAIL_MAX_LENGTH) {
    return { valid: false, error: `Email must be at most ${VALIDATION.EMAIL_MAX_LENGTH} characters` };
  }
  if (!REGEX.EMAIL.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true, error: null };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters` };
  }
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    return { valid: false, error: `Password must be at most ${VALIDATION.PASSWORD_MAX_LENGTH} characters` };
  }
  if (!REGEX.STRONG_PASSWORD.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    };
  }
  return { valid: true, error: null };
}

export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  return { valid: true, error: null };
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}
