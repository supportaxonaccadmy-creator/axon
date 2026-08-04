export { unitTestingService } from './unitTestingService';
export { integrationTestingService } from './integrationTestingService';
export { e2eTestingService } from './e2eTestingService';
export { apiTestingService } from './apiTestingService';
export { databaseTestingService } from './databaseTestingService';
export { performanceTestingService } from './performanceTestingService';
export { securityTestingService } from './securityTestingService';
export { qaService } from './qaService';
export { testReportService } from './testReportService';
export { createTest, createSuite, calculatePassRate, formatDuration, getStatusColor, getSeverityColor } from './testHelpers';

export type {
  TestStatus, TestSeverity, TestCategory, TestCase, TestSuite, TestReport, TestCoverage,
  PerformanceMetric, SecurityFinding, QAResult, TestModule,
} from './testing.types';
