import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

export const enrollmentValidator = {
  async validateEnrollment(enrollmentId: string): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    const { data: enrollment } = await supabase.from('enrollments').select('*').eq('id', enrollmentId).maybeSingle();
    if (!enrollment) {
      issues.push({ type: 'missing_enrollment', entity: 'enrollment', id: enrollmentId, message: 'Enrollment does not exist', severity: 'error' });
      return makeReport(issues);
    }

    if (!enrollment.profile_id) {
      issues.push({ type: 'missing_profile', entity: 'enrollment', id: enrollmentId, message: 'Enrollment has no profile_id', severity: 'error' });
    }
    if (!enrollment.batch_id) {
      issues.push({ type: 'missing_batch', entity: 'enrollment', id: enrollmentId, message: 'Enrollment has no batch_id', severity: 'error' });
    } else {
      const { data: batch } = await supabase.from('batches').select('id').eq('id', enrollment.batch_id).maybeSingle();
      if (!batch) {
        issues.push({ type: 'broken_batch_ref', entity: 'enrollment', id: enrollmentId, message: `Enrollment references non-existent batch ${enrollment.batch_id}`, severity: 'error' });
      }
    }
    if (!enrollment.pricing_id) {
      issues.push({ type: 'missing_pricing', entity: 'enrollment', id: enrollmentId, message: 'Enrollment has no pricing_id', severity: 'warning' });
    } else {
      const { data: pricing } = await supabase.from('batch_pricing').select('id').eq('id', enrollment.pricing_id).maybeSingle();
      if (!pricing) {
        issues.push({ type: 'broken_pricing_ref', entity: 'enrollment', id: enrollmentId, message: `Enrollment references non-existent pricing ${enrollment.pricing_id}`, severity: 'warning' });
      }
    }

    if (enrollment.access_status === 'active' && enrollment.expires_at) {
      const expiry = new Date(enrollment.expires_at);
      if (expiry < new Date()) {
        issues.push({ type: 'expired_but_active', entity: 'enrollment', id: enrollmentId, message: 'Enrollment is active but has expired', severity: 'warning' });
      }
    }

    if (enrollment.enrollment_type === 'purchase' && enrollment.purchase_id) {
      const { data: purchase } = await supabase.from('purchases').select('id, payment_status').eq('id', enrollment.purchase_id).maybeSingle();
      if (!purchase) {
        issues.push({ type: 'broken_purchase_ref', entity: 'enrollment', id: enrollmentId, message: `Enrollment references non-existent purchase ${enrollment.purchase_id}`, severity: 'error' });
      } else if (purchase.payment_status !== 'completed') {
        issues.push({ type: 'unpaid_purchase_enrollment', entity: 'enrollment', id: enrollmentId, message: `Enrollment linked to ${purchase.payment_status} purchase`, severity: 'warning' });
      }
    }

    return makeReport(issues);
  },

  async validateAllEnrollments(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const { data: enrollments } = await supabase.from('enrollments').select('id');
    const allIssues: IntegrityIssue[] = [];
    for (const e of enrollments ?? []) {
      const report = await this.validateEnrollment(e.id);
      allIssues.push(...report.issues);
    }
    return makeReport(allIssues);
  },

  async checkDuplicateEnrollments(profileId: string, batchId: string): Promise<{ duplicates: string[] }> {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from('enrollments').select('id').eq('profile_id', profileId).eq('batch_id', batchId).neq('access_status', 'cancelled');
    return { duplicates: (data ?? []).map((r: { id: string }) => r.id) };
  },
};
