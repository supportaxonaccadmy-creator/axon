import type { TestReport, TestSuite, TestCoverage } from './testing.types';

class TestReportService {
  generateReport(name: string, suites: TestSuite[]): TestReport {
    const totalSuites = suites.length;
    const totalTests = suites.reduce((acc, s) => acc + s.totalTests, 0);
    const passedTests = suites.reduce((acc, s) => acc + s.passedTests, 0);
    const failedTests = suites.reduce((acc, s) => acc + s.failedTests, 0);
    const skippedTests = suites.reduce((acc, s) => acc + s.skippedTests, 0);
    const warningTests = suites.reduce((acc, s) => acc + s.tests.filter((t) => t.status === 'warning').length, 0);
    const duration = suites.reduce((acc, s) => acc + s.duration, 0);
    const failedModules = [...new Set(suites.filter((s) => s.status === 'fail').map((s) => s.module))];
    const coverage = this.calculateCoverage(suites);
    const recommendations = this.generateRecommendations(suites, failedModules);
    return {
      id: `report-${Date.now()}`, name, timestamp: new Date().toISOString(),
      totalSuites, totalTests, passedTests, failedTests, skippedTests, warningTests, duration,
      coverage, status: failedTests === 0 ? 'pass' : 'fail', suites, failedModules, recommendations,
    };
  }

  private calculateCoverage(suites: TestSuite[]): TestCoverage {
    const modules = [...new Set(suites.map((s) => s.module))];
    const categories = [...new Set(suites.map((s) => s.category))];
    const byModule: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const mod of modules) {
      const modSuites = suites.filter((s) => s.module === mod);
      const total = modSuites.reduce((acc, s) => acc + s.totalTests, 0);
      const passed = modSuites.reduce((acc, s) => acc + s.passedTests, 0);
      byModule[mod] = total > 0 ? Math.round((passed / total) * 100) : 0;
    }
    for (const cat of categories) {
      const catSuites = suites.filter((s) => s.category === cat);
      const total = catSuites.reduce((acc, s) => acc + s.totalTests, 0);
      const passed = catSuites.reduce((acc, s) => acc + s.passedTests, 0);
      byCategory[cat] = total > 0 ? Math.round((passed / total) * 100) : 0;
    }
    const overallTotal = suites.reduce((acc, s) => acc + s.totalTests, 0);
    const overallPassed = suites.reduce((acc, s) => acc + s.passedTests, 0);
    return { overall: overallTotal > 0 ? Math.round((overallPassed / overallTotal) * 100) : 0, byModule, byCategory };
  }

  private generateRecommendations(suites: TestSuite[], failedModules: string[]): string[] {
    const recommendations: string[] = [];
    if (failedModules.length > 0) recommendations.push(`Fix failing tests in: ${failedModules.join(', ')}`);
    const lowCoverageModules = suites.filter((s) => s.totalTests < 3).map((s) => s.module);
    if (lowCoverageModules.length > 0) recommendations.push(`Add more test coverage for: ${[...new Set(lowCoverageModules)].join(', ')}`);
    const slowSuites = suites.filter((s) => s.duration > 1000);
    if (slowSuites.length > 0) recommendations.push(`Optimize slow test suites: ${slowSuites.map((s) => s.name).join(', ')}`);
    if (recommendations.length === 0) recommendations.push('All tests passing. No recommendations needed.');
    return recommendations;
  }

  generateSummaryReport(report: TestReport): string {
    const lines = [
      `# ${report.name}`, `Generated: ${new Date(report.timestamp).toLocaleString()}`, '',
      '## Summary', `- Total Tests: ${report.totalTests}`, `- Passed: ${report.passedTests}`, `- Failed: ${report.failedTests}`,
      `- Skipped: ${report.skippedTests}`, `- Duration: ${report.duration}ms`, `- Coverage: ${report.coverage.overall}%`,
      `- Status: ${report.status.toUpperCase()}`, '',
    ];
    if (report.failedModules.length > 0) { lines.push('## Failed Modules'); report.failedModules.forEach((m) => lines.push(`- ${m}`)); lines.push(''); }
    if (report.recommendations.length > 0) { lines.push('## Recommendations'); report.recommendations.forEach((r) => lines.push(`- ${r}`)); }
    return lines.join('\n');
  }
}

export const testReportService = new TestReportService();
