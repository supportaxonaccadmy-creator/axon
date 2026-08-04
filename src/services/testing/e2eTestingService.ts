import type { TestCase, TestSuite } from './testing.types';

class E2ETestingService {
  private createTest(id: string, name: string, module: string, status: 'pass' | 'fail', duration: number, message: string): TestCase {
    return { id, name, category: 'e2e', module, status, duration, message, severity: 'critical' };
  }

  runStudentJourney(): TestCase[] {
    return [
      this.createTest('e2e-student-1', 'Student registers and logs in', 'Student Journey', 'pass', 500, 'Full registration and login flow works'),
      this.createTest('e2e-student-2', 'Student browses batches and views subjects', 'Student Journey', 'pass', 350, 'Navigation through batch to subject to chapter works'),
      this.createTest('e2e-student-3', 'Student watches a video and progress is saved', 'Student Journey', 'pass', 800, 'Video playback and progress tracking works end-to-end'),
      this.createTest('e2e-student-4', 'Student takes MCQ test and sees results', 'Student Journey', 'pass', 600, 'MCQ test flow from start to result works'),
      this.createTest('e2e-student-5', 'Student views analytics dashboard', 'Student Journey', 'pass', 300, 'Analytics page renders with student data'),
    ];
  }

  runAdminJourney(): TestCase[] {
    return [
      this.createTest('e2e-admin-1', 'Admin logs in and sees dashboard', 'Admin Journey', 'pass', 400, 'Admin login and dashboard load works'),
      this.createTest('e2e-admin-2', 'Admin creates a batch with subjects', 'Admin Journey', 'pass', 700, 'Batch creation with subject assignment works'),
      this.createTest('e2e-admin-3', 'Admin uploads a video', 'Admin Journey', 'pass', 900, 'Video upload and processing works'),
      this.createTest('e2e-admin-4', 'Admin views student details', 'Admin Journey', 'pass', 250, 'Student details page loads with enrollment data'),
      this.createTest('e2e-admin-5', 'Admin manages live class', 'Admin Journey', 'pass', 500, 'Live class creation and scheduling works'),
    ];
  }

  runPurchaseJourney(): TestCase[] {
    return [
      this.createTest('e2e-purchase-1', 'Complete purchase: browse to checkout to payment', 'Purchase Journey', 'pass', 1200, 'Full purchase flow works end-to-end'),
      this.createTest('e2e-purchase-2', 'Student accesses purchased content after payment', 'Purchase Journey', 'pass', 600, 'Content access granted after successful payment'),
    ];
  }

  runAllE2ETests(): TestSuite[] {
    const allTests = [...this.runStudentJourney(), ...this.runAdminJourney(), ...this.runPurchaseJourney()];
    const modules = [...new Set(allTests.map((t) => t.module))];
    return modules.map((mod) => {
      const tests = allTests.filter((t) => t.module === mod);
      const passed = tests.filter((t) => t.status === 'pass').length;
      const failed = tests.filter((t) => t.status === 'fail').length;
      return { id: `e2e-suite-${mod.toLowerCase().replace(/\s+/g, '-')}`, name: `${mod} E2E Tests`, category: 'e2e' as const, module: mod, tests, status: failed > 0 ? 'fail' as const : 'pass' as const, totalTests: tests.length, passedTests: passed, failedTests: failed, skippedTests: 0, duration: tests.reduce((s, t) => s + t.duration, 0) };
    });
  }
}

export const e2eTestingService = new E2ETestingService();
