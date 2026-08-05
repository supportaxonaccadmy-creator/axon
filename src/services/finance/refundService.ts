import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Refund, RefundType, RefundStatus, GatewayType } from './finance.types';

class RefundService {
  async createRefund(params: { purchaseId: string; profileId: string; refundType: RefundType; amount: number; currency: string; reason?: string; gateway?: GatewayType; processedBy?: string }): Promise<Refund | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('refunds').insert({ purchase_id: params.purchaseId, profile_id: params.profileId, refund_type: params.refundType, status: 'pending', amount: params.amount, currency: params.currency, reason: params.reason ?? null, gateway: params.gateway ?? null }).select('*').single();
    if (error) { logger.error('RefundService.createRefund', { error: error.message }); return null; }
    return this.mapRefund(data);
  }
  async processRefund(id: string, processedBy: string, gatewayRefundId?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('refunds').update({ status: 'completed', processed_by: processedBy, processed_at: new Date().toISOString(), gateway_refund_id: gatewayRefundId ?? null }).eq('id', id);
    if (error) { logger.error('RefundService.processRefund', { error: error.message }); return false; }
    return true;
  }
  async updateRefundStatus(id: string, status: RefundStatus): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('refunds').update({ status }).eq('id', id);
    if (error) { logger.error('RefundService.updateRefundStatus', { error: error.message }); return false; }
    return true;
  }
  async getRefunds(profileId?: string, limit = 50): Promise<Refund[]> {
    const supabase = getSupabaseClient();
    let query = supabase.from('refunds').select('*').order('created_at', { ascending: false }).limit(limit);
    if (profileId) query = query.eq('profile_id', profileId);
    const { data, error } = await query;
    if (error) { logger.error('RefundService.getRefunds', { error: error.message }); return []; }
    return (data ?? []).map((r: Record<string, unknown>) => this.mapRefund(r));
  }
  async getRefundById(id: string): Promise<Refund | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('refunds').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapRefund(data);
  }
  async getRefundStats(): Promise<{ total: number; pending: number; completed: number; failed: number; totalAmount: number }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('refunds').select('amount, status');
    if (error) return { total: 0, pending: 0, completed: 0, failed: 0, totalAmount: 0 };
    const rows = data ?? [];
    return { total: rows.length, pending: rows.filter((r: Record<string, unknown>) => r.status === 'pending').length, completed: rows.filter((r: Record<string, unknown>) => r.status === 'completed').length, failed: rows.filter((r: Record<string, unknown>) => r.status === 'failed').length, totalAmount: rows.filter((r: Record<string, unknown>) => r.status === 'completed').reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.amount), 0) };
  }
  private mapRefund(r: Record<string, unknown>): Refund {
    return { id: r.id as string, purchaseId: r.purchase_id as string, profileId: r.profile_id as string, refundType: r.refund_type as RefundType, status: r.status as RefundStatus, amount: Number(r.amount), currency: r.currency as string, reason: r.reason as string | null, gateway: r.gateway as GatewayType | null, gatewayRefundId: r.gateway_refund_id as string | null, processedBy: r.processed_by as string | null, processedAt: r.processed_at as string | null, metadata: r.metadata as Record<string, unknown> | null, createdAt: r.created_at as string, updatedAt: r.updated_at as string };
  }
}
export const refundService = new RefundService();
