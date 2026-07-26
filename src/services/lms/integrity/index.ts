export { hierarchyValidator } from './hierarchyValidator';
export type { IntegrityIssue, IntegrityReport } from './hierarchyValidator';
export { relationshipValidator } from './relationshipValidator';
export { enrollmentValidator } from './enrollmentValidator';
export { purchaseValidator } from './purchaseValidator';
export { pricingValidator } from './pricingValidator';
export { duplicateDetector } from './duplicateDetector';
export { missingReferenceDetector } from './missingReferenceDetector';
export { brokenHierarchyDetector } from './brokenHierarchyDetector';

export const integrityEngine = {
  async runFullIntegrityCheck(): Promise<{
    hierarchy: import('./hierarchyValidator').IntegrityReport;
    relationships: import('./hierarchyValidator').IntegrityReport;
    enrollments: import('./hierarchyValidator').IntegrityReport;
    purchases: import('./hierarchyValidator').IntegrityReport;
    pricing: import('./hierarchyValidator').IntegrityReport;
    duplicates: import('./hierarchyValidator').IntegrityReport;
    missingReferences: import('./hierarchyValidator').IntegrityReport;
    brokenHierarchy: import('./hierarchyValidator').IntegrityReport;
    overall: { valid: boolean; totalErrors: number; totalWarnings: number };
  }> {
    const { hierarchyValidator } = await import('./hierarchyValidator');
    const { relationshipValidator } = await import('./relationshipValidator');
    const { enrollmentValidator } = await import('./enrollmentValidator');
    const { purchaseValidator } = await import('./purchaseValidator');
    const { pricingValidator } = await import('./pricingValidator');
    const { duplicateDetector } = await import('./duplicateDetector');
    const { missingReferenceDetector } = await import('./missingReferenceDetector');
    const { brokenHierarchyDetector } = await import('./brokenHierarchyDetector');

    const [hierarchy, relationships, enrollments, purchases, pricing, duplicates, missingReferences, brokenHierarchy] = await Promise.all([
      hierarchyValidator.validateFullHierarchy(),
      relationshipValidator.validateAllRelationships(),
      enrollmentValidator.validateAllEnrollments(),
      purchaseValidator.validateAllPurchases(),
      pricingValidator.validateAllPricing(),
      duplicateDetector.detectAllDuplicates(),
      missingReferenceDetector.detectAllMissingReferences(),
      brokenHierarchyDetector.detectBrokenHierarchy(),
    ]);

    const totalErrors = [hierarchy, relationships, enrollments, purchases, pricing, duplicates, missingReferences, brokenHierarchy]
      .reduce((sum, r) => sum + r.summary.errors, 0);
    const totalWarnings = [hierarchy, relationships, enrollments, purchases, pricing, duplicates, missingReferences, brokenHierarchy]
      .reduce((sum, r) => sum + r.summary.warnings, 0);

    return {
      hierarchy, relationships, enrollments, purchases, pricing, duplicates, missingReferences, brokenHierarchy,
      overall: { valid: totalErrors === 0, totalErrors, totalWarnings },
    };
  },
};
