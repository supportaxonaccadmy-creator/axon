export type TestStatus = 'pass' | 'fail' | 'pending' | 'skipped' | 'warning';
export type TestSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type TestCategory = 'unit' | 'integration' | 'e2e' | 'api' | 'database' | 'performance' | 'security' | 'ui' | 'seo';

export interface TestCase {
  id: string;
  name: string;
  category: TestCategory;
  module: string;
  status: TestStatus;
  duration: number;
  message: string;
  severity: TestSeverity;
  stackTrace?: string;
  assertion?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  category: TestCategory;
  module: string;
  tests: TestCase[];
  status: TestStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
}

export interface TestReport {
  id: string;
  name: string;
  timestamp: string;
  totalSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  warningTests: number;
  duration: number;
  coverage: TestCoverage;
  status: TestStatus;
  suites: TestSuite[];
  failedModules: string[];
  recommendations: string[];
}

export interface TestCoverage {
  overall: number;
  byModule: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: TestStatus;
  message: string;
}

export interface SecurityFinding {
  id: string;
  name: string;
  severity: TestSeverity;
  status: TestStatus;
  description: string;
  recommendation: string;
}

export interface QAResult {
  ready: boolean;
  score: number;
  total: number;
  percentage: number;
  status: string;
  categories: { name: string; passed: number; total: number; percentage: number }[];
}

export interface TestModule {
  id: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  testCount: number;
  lastRun: string;
}
