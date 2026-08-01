import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Certificate, CreateCertificateInput } from './gamification.types';
import { mapCertificateRow, generateCertificateNumber, generateVerificationCode } from './gamificationHelpers';

export const certificateService = {
  async create(adminId: string, input: CreateCertificateInput): Promise<{ data: Certificate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const certNumber = generateCertificateNumber();
      const verifyCode = generateVerificationCode();
      const { data, error } = await supabase.from('certificates').insert({
        certificate_number: certNumber,
        verification_code: verifyCode,
        student_id: input.studentId,
        batch_id: input.batchId ?? null,
        template_id: input.templateId ?? null,
        type: input.type ?? 'course_completion',
        status: 'active',
        student_name: input.studentName,
        batch_name: input.batchName ?? null,
        course_name: input.courseName ?? null,
        instructor_name: input.instructorName ?? null,
        completion_date: input.completionDate ?? new Date().toISOString(),
        expiry_date: input.expiryDate ?? null,
        issued_by: adminId,
        metadata: input.metadata ?? {},
      }).select('*').maybeSingle();
      if (error) { logger.error('certificateService.create', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapCertificateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string): Promise<{ data: Certificate[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificates')
        .select('*').eq('student_id', studentId).order('created_at', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapCertificateRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAll(limit: number = 50, offset: number = 0): Promise<{ data: Certificate[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificates')
        .select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapCertificateRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByVerificationCode(code: string): Promise<{ data: Certificate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificates')
        .select('*').eq('verification_code', code).eq('status', 'active').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapCertificateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async revoke(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('certificates').update({ status: 'revoked' }).eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: Certificate | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificates').select('*').eq('id', id).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapCertificateRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStats(): Promise<{ data: { total: number; active: number; revoked: number; expired: number }; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('certificates').select('status');
      if (error) return { data: { total: 0, active: 0, revoked: 0, expired: 0 }, error: error.message };
      const all = (data ?? []) as Array<Record<string, unknown>>;
      return {
        data: {
          total: all.length,
          active: all.filter((r) => r.status === 'active').length,
          revoked: all.filter((r) => r.status === 'revoked').length,
          expired: all.filter((r) => r.status === 'expired').length,
        },
        error: null,
      };
    } catch (err) {
      return { data: { total: 0, active: 0, revoked: 0, expired: 0 }, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};