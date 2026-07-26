import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

export const purchaseValidator = {
  async validatePurchase(purchaseId: string): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    const { data: purchase } = await supabase.from('purchases').select('*').eq('id', purchaseId).maybeSingle();
    if (!purchase) {
      issues.push({ type: 'missing_purchase', entity: 'purchase', id: purchaseId, message: 'Purchase does not exist', severity: 'error' });
      return makeReport(issues);
    }

    if (!purchase.profile_id) {
      issues.push({ type: 'missing_profile', entity: 'purchase', id: purchaseId, message: 'Purchase has no profile_id', severity: 'error' });
    }
    if (!purchase.batch_id) {
      issues.push({ type: 'missing_batch', entity: 'purchase', id: purchaseId, message: 'Purchase has no batch_id', severity: 'error' });
    } else {
      const { data: batch } = await supabase.from('batches').select('id').eq('id', purchase.batch_id).maybeSingle();
      if (!batch) {
        issues.push({ type: 'broken_batch_ref', entity: 'purchase', id: purchaseId, message: `Purchase references non-existent batch ${purchase.batch_id}`, severity: 'error' });
      }
    }
    if (!purchase.pricing_id) {
      issues.push({ type: 'missing_pricing', entity: 'purchase', id: purchaseId, message: 'Purchase has no pricing_id', severity: 'warning' });
    }

    if (purchase.amount !== undefined && typeof purchase.amount === 'number' && purchase.amount < 0) {
      issues.push({ type: 'negative_amount', entity: 'purchase', id: purchaseId, message: 'Purchase amount is negative', severity: 'error' });
    }

    if (purchase.payment_status === 'completed' && !purchase.transaction_reference) {
      issues.push({ type: 'missing_transaction_ref', entity: 'purchase', id: purchaseId, message: 'Completed purchase has no transaction reference', severity: 'warning' });
    }

    if (purchase.payment_status === 'completed') {
      const { data: enrollment } = await supabase.from('enrollments').select('id').eq('purchase_id', purchaseId).maybeSingle();
      if (!enrollment) {
        issues.push({ type: 'orphaned_purchase', entity: 'purchase', id: purchaseId, message: 'Completed purchase has no associated enrollment', severity: 'warning' });
      }
    }

    return makeReport(issues);
  },

  async validateAllPurchases(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const { data: purchases } = await supabase.from('purchases').select('id');
    const allIssues: IntegrityIssue[] = [];
    for (const p of purchases ?? []) {
      const report = await this.validatePurchase(p.id);
      allIssues.push(...report.issues);
    }
    return makeReport(allIssues);
  },
};
