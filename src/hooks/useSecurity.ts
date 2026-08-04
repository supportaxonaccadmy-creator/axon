import { useEffect, useCallback } from 'react';
import { securityService, inputSanitizer, securityLogger } from '@/services/security';

export function useSecurity() {
  useEffect(() => { securityService.applyMetaTags(); }, []);
  const sanitizeInput = useCallback((input: string, maxLength?: number) => inputSanitizer.sanitizeInput(input, maxLength), []);
  const sanitizeHTML = useCallback((input: string) => inputSanitizer.sanitizeHTML(input), []);
  const sanitizeEmail = useCallback((email: string) => inputSanitizer.sanitizeEmail(email), []);
  const sanitizeURL = useCallback((url: string) => inputSanitizer.sanitizeURL(url), []);
  const sanitizeObject = useCallback(<T extends Record<string, unknown>>(obj: T) => inputSanitizer.sanitizeObject(obj), []);
  const containsXSS = useCallback((input: string) => inputSanitizer.containsXSS(input), []);
  const logSecurityEvent = useCallback((eventType: string, severity: 'info' | 'warning' | 'critical', message: string, context?: Record<string, unknown>) => { securityLogger.log(eventType as never, severity, message, context); }, []);
  return { sanitizeInput, sanitizeHTML, sanitizeEmail, sanitizeURL, sanitizeObject, containsXSS, logSecurityEvent, isSecureContext: securityService.isSecureContext() };
}
