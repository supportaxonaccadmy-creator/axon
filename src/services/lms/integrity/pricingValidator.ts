import { getSupabaseClient } from '@/lib/supabase';
import type { IntegrityReport, IntegrityIssue } from './hierarchyValidator';

function makeReport(issues: IntegrityIssue[]): IntegrityReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return { valid: errors === 0, issues, summary: { errors, warnings } };
}

export const pricingValidator = {
  async validatePricing(pricingId: string): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const issues: IntegrityIssue[] = [];

    const { data: pricing } = await supabase.from('batch_pricing').select('*').eq('id', pricingId).maybeSingle();
    if (!pricing) {
      issues.push({ type: 'missing_pricing', entity: 'pricing', id: pricingId, message: 'Pricing does not exist', severity: 'error' });
      return makeReport(issues);
    }

    if (!pricing.batch_id) {
      issues.push({ type: 'missing_batch', entity: 'pricing', id: pricingId, message: 'Pricing has no batch_id', severity: 'error' });
    } else {
      const { data: batch } = await supabase.from('batches').select('id').eq('id', pricing.batch_id).maybeSingle();
      if (!batch) {
        issues.push({ type: 'broken_batch_ref', entity: 'pricing', id: pricingId, message: `Pricing references non-existent batch ${pricing.batch_id}`, severity: 'error' });
      }
    }

    if (pricing.price !== undefined && typeof pricing.price === 'number' && pricing.price < 0) {
      issues.push({ type: 'negative_price', entity: 'pricing', id: pricingId, message: 'Price is negative', severity: 'error' });
    }

    if (pricing.sale_price !== undefined && pricing.sale_price !== null) {
      if (typeof pricing.sale_price !== 'number' || pricing.sale_price < 0) {
        issues.push({ type: 'invalid_sale_price', entity: 'pricing', id: pricingId, message: 'Sale price is invalid or negative', severity: 'error' });
      } else if (typeof pricing.price === 'number' && pricing.sale_price >= pricing.price) {
        issues.push({ type: 'sale_price_too_high', entity: 'pricing', id: pricingId, message: 'Sale price should be less than regular price', severity: 'warning' });
      }
    }

    if (pricing.is_free === false && (!pricing.price || pricing.price === 0)) {
      issues.push({ type: 'zero_paid_price', entity: 'pricing', id: pricingId, message: 'Pricing is not free but price is zero', severity: 'warning' });
    }

    if (pricing.access_duration_days !== null && pricing.access_duration_days !== undefined) {
      if (typeof pricing.access_duration_days !== 'number' || pricing.access_duration_days < 0) {
        issues.push({ type: 'invalid_duration', entity: 'pricing', id: pricingId, message: 'Access duration days is invalid or negative', severity: 'error' });
      }
    }

    return makeReport(issues);
  },

  async validateAllPricing(): Promise<IntegrityReport> {
    const supabase = getSupabaseClient();
    const { data: pricings } = await supabase.from('batch_pricing').select('id');
    const allIssues: IntegrityIssue[] = [];
    for (const p of pricings ?? []) {
      const report = await this.validatePricing(p.id);
      allIssues.push(...report.issues);
    }
    return makeReport(allIssues);
  },

  async checkDuplicatePricing(batchId: string): Promise<{ duplicates: string[] }> {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from('batch_pricing').select('id').eq('batch_id', batchId);
    return { duplicates: (data ?? []).map((r: { id: string }) => r.id) };
  },
};
