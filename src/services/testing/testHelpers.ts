import type { TestCase, TestSuite } from './testing.types';

export function createTest(id: string, name: string, category: TestCase['category'], module: string, status: TestCase['status'], duration: number, message: string, severity: TestCase['severity'] = 'medium'): TestCase {
  return { id, name, category, module, status, duration, message, severity };
}

export function createSuite(id: string, name: string, category: TestSuite['category'], module: string, tests: TestCase[]): TestSuite {
  const passed = tests.filter((t) => t.status === 'pass').length;
  const failed = tests.filter((t) => t.status === 'fail').length;
  const skipped = tests.filter((t) => t.status === 'skipped').length;
  return {
    id, name, category, module, tests,
    status: failed > 0 ? 'fail' : 'pass',
    totalTests: tests.length, passedTests: passed, failedTests: failed, skippedTests: skipped,
    duration: tests.reduce((sum, t) => sum + t.duration, 0),
  };
}

export function calculatePassRate(passed: number, total: number): number {
  return total > 0 ? Math.round((passed / total) * 100) : 0;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pass': return 'text-success-600 bg-success-50';
    case 'fail': return 'text-error-600 bg-error-50';
    case 'warning': return 'text-warning-600 bg-warning-50';
    case 'pending': return 'text-neutral-500 bg-neutral-50';
    case 'skipped': return 'text-neutral-400 bg-neutral-50';
    default: return 'text-neutral-500 bg-neutral-50';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-error-100 text-error-700';
    case 'high': return 'bg-error-50 text-error-600';
    case 'medium': return 'bg-warning-50 text-warning-700';
    case 'low': return 'bg-primary-50 text-primary-700';
    case 'info': return 'bg-neutral-50 text-neutral-600';
    default: return 'bg-neutral-50 text-neutral-600';
  }
}
