import { getSupabaseClient } from '@/lib/supabase';
import type { CertificateVerification, Certificate } from './gamification.types';
import { mapCertificateRow } from './gamificationHelpers';

export const certificateVerificationService = {
  async verify(code: string, verifiedBy?: string | null, ipAddress?: string | null, userAgent?: string | null): Promise<{ data: Certificate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: cert, error: certError } = await supabase.from('certificates')
        .select('*').eq('verification_code', code).eq('status', 'active').maybeSingle();
      if (certError) return { data: null, error: certError.message };
      if (!cert) return { data: null, error: 'Certificate not found or invalid' };

      await supabase.from('certificate_verifications').insert({
        certificate_id: (cert as Record<string, unknown>).id,
        verified_by: verifiedBy ?? null,
        ip_address: ipAddress ?? null,
        user_agent: userAgent ?? null,
      });

      return { data: mapCertificateRow(cert as Record<string, unknown>), error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getVerifications(certificateId: string): Promise<{ data: CertificateVerification[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificate_verifications')
        .select('*').eq('certificate_id', certificateId).order('verified_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return {
        data: (data ?? []).map((r) => ({
          id: String((r as Record<string, unknown>).id),
          certificateId: String((r as Record<string, unknown>).certificate_id),
          verifiedBy: ((r as Record<string, unknown>).verified_by as string | null) ?? null,
          verifiedAt: String((r as Record<string, unknown>).verified_at),
          ipAddress: ((r as Record<string, unknown>).ip_address as string | null) ?? null,
          userAgent: ((r as Record<string, unknown>).user_agent as string | null) ?? null,
        })),
        error: null,
      };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};