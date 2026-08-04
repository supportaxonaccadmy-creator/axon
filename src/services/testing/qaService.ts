import type { QAResult, TestSuite, TestReport } from './testing.types';
import { unitTestingService } from './unitTestingService';
import { integrationTestingService } from './integrationTestingService';
import { e2eTestingService } from './e2eTestingService';
import { apiTestingService } from './apiTestingService';
import { databaseTestingService } from './databaseTestingService';
import { testReportService } from './testReportService';

class QAService {
  private getAllSuites(): TestSuite[] {
    return [
      ...unitTestingService.runAllUnitTests(),
      ...integrationTestingService.runAllIntegrationTests(),
      ...e2eTestingService.runAllE2ETests(),
      ...apiTestingService.runAllAPITests(),
      ...databaseTestingService.runAllDatabaseTests(),
    ];
  }

  runSmokeTests(): TestSuite[] {
    const all = this.getAllSuites();
    return all.map((suite) => ({
      ...suite,
      tests: suite.tests.slice(0, 1),
      totalTests: 1,
      passedTests: suite.tests[0]?.status === 'pass' ? 1 : 0,
      failedTests: suite.tests[0]?.status === 'fail' ? 1 : 0,
      name: `${suite.name} (Smoke)`,
    }));
  }

  runRegressionTests(): TestSuite[] {
    return this.getAllSuites();
  }

  runFullQASuite(): TestReport {
    const suites = this.getAllSuites();
    return testReportService.generateReport('Full QA Suite', suites);
  }

  getQAResult(): QAResult {
    const suites = this.getAllSuites();
    const report = testReportService.generateReport('QA Result', suites);
    const categories = [...new Set(suites.map((s) => s.category))];
    const categoryResults = categories.map((cat) => {
      const catSuites = suites.filter((s) => s.category === cat);
      const total = catSuites.reduce((acc, s) => acc + s.totalTests, 0);
      const passed = catSuites.reduce((acc, s) => acc + s.passedTests, 0);
      return { name: cat, passed, total, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 };
    });
    const totalTests = report.totalTests;
    const passedTests = report.passedTests;
    const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    return {
      ready: percentage === 100,
      score: passedTests,
      total: totalTests,
      percentage,
      status: percentage === 100 ? 'Production Ready' : percentage >= 80 ? 'Nearly Ready' : 'Needs Work',
      categories: categoryResults,
    };
  }

  getModuleHealth(): { id: string; name: string; status: string; testCount: number; lastRun: string }[] {
    const suites = this.getAllSuites();
    const modules = [...new Set(suites.map((s) => s.module))];
    return modules.map((mod) => {
      const modSuites = suites.filter((s) => s.module === mod);
      const totalTests = modSuites.reduce((acc, s) => acc + s.totalTests, 0);
      const failed = modSuites.reduce((acc, s) => acc + s.failedTests, 0);
      return { id: `mod-${mod.toLowerCase().replace(/\s+/g, '-')}`, name: mod, status: failed > 0 ? 'fail' : 'pass', testCount: totalTests, lastRun: new Date().toISOString() };
    });
  }
}

export const qaService = new QAService();
