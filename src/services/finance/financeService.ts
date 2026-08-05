import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { FinanceDashboard, PaymentOrder, PaymentTransaction, PaymentLog, GatewayType } from './finance.types';

class FinanceService {
  async getDashboard(): Promise<FinanceDashboard> {
    const supabase = getSupabaseClient();
    const { data: purchases } = await supabase.from('purchases').select('amount, payment_status, gateway, created_at, batch_id');
    const rows = purchases ?? [];
    const completed = rows.filter((p: Record<string, unknown>) => p.payment_status === 'completed');
    const pending = rows.filter((p: Record<string, unknown>) => p.payment_status === 'pending');
    const failed = rows.filter((p: Record<string, unknown>) => p.payment_status === 'failed');
    const totalRevenue = completed.reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.amount), 0);
    const now = new Date();
    const monthlyRevenue = completed.filter((p: Record<string, unknown>) => new Date(p.created_at as string).getMonth() === now.getMonth() && new Date(p.created_at as string).getFullYear() === now.getFullYear()).reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.amount), 0);
    const today = now.toDateString();
    const dailyRevenue = completed.filter((p: Record<string, unknown>) => new Date(p.created_at as string).toDateString() === today).reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.amount), 0);
    const yearlyRevenue = completed.filter((p: Record<string, unknown>) => new Date(p.created_at as string).getFullYear() === now.getFullYear()).reduce((sum: number, p: Record<string, unknown>) => sum + Number(p.amount), 0);
    const { data: refunds } = await supabase.from('refunds').select('amount, status');
    const refundRows = refunds ?? [];
    const refundAmount = refundRows.filter((r: Record<string, unknown>) => r.status === 'completed').reduce((sum: number, r: Record<string, unknown>) => sum + Number(r.amount), 0);
    const { count: couponsUsed } = await supabase.from('coupon_usage').select('*', { count: 'exact', head: true });
    const { data: walletTx } = await supabase.from('wallet_transactions').select('amount, type');
    const walletUsage = (walletTx ?? []).filter((w: Record<string, unknown>) => w.type === 'debit').reduce((sum: number, w: Record<string, unknown>) => sum + Number(w.amount), 0);
    const batchMap = new Map<string, { sales: number; revenue: number }>();
    for (const p of completed) { const bid = p.batch_id as string; const existing = batchMap.get(bid) ?? { sales: 0, revenue: 0 }; batchMap.set(bid, { sales: existing.sales + 1, revenue: existing.revenue + Number(p.amount) }); }
    const { data: batches } = await supabase.from('batches').select('id, title').in('id', [...batchMap.keys()]);
    const topSellingBatches = Array.from(batchMap.entries()).map(([batchId, stats]) => ({ batchId, title: batches?.find((b: Record<string, unknown>) => b.id === batchId)?.title ?? 'Unknown', sales: stats.sales, revenue: stats.revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const gatewayMap = new Map<string, { count: number; revenue: number }>();
    for (const p of completed) { const gw = (p.gateway as string) ?? 'unknown'; const existing = gatewayMap.get(gw) ?? { count: 0, revenue: 0 }; gatewayMap.set(gw, { count: existing.count + 1, revenue: existing.revenue + Number(p.amount) }); }
    const gatewayStats = Array.from(gatewayMap.entries()).map(([gateway, stats]) => ({ gateway, count: stats.count, revenue: stats.revenue }));
    const monthMap = new Map<string, number>();
    for (const p of completed) { const date = new Date(p.created_at as string); const key = date.toLocaleString('en-US', { month: 'short', year: 'numeric' }); monthMap.set(key, (monthMap.get(key) ?? 0) + Number(p.amount)); }
    const revenueByMonth = Array.from(monthMap.entries()).map(([month, revenue]) => ({ month, revenue }));
    return { totalRevenue, monthlyRevenue, dailyRevenue, yearlyRevenue, totalPurchases: rows.length, completedPurchases: completed.length, pendingPurchases: pending.length, failedPurchases: failed.length, paymentSuccessRate: rows.length > 0 ? Math.round((completed.length / rows.length) * 100) : 0, refundAmount, totalRefunds: refundRows.length, couponsUsed: couponsUsed ?? 0, walletUsage, averageOrderValue: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0, topSellingBatches, gatewayStats, revenueByMonth };
  }

  async createPaymentOrder(params: { profileId: string; batchId: string; pricingId: string; amount: number; currency: string; gateway: GatewayType; couponCode?: string; couponDiscount?: number; taxAmount?: number; finalAmount: number }): Promise<{ data: PaymentOrder | null; error: string | null }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('payment_orders').insert({ profile_id: params.profileId, batch_id: params.batchId, pricing_id: params.pricingId, gateway: params.gateway, amount: params.amount, currency: params.currency, coupon_code: params.couponCode ?? null, coupon_discount: params.couponDiscount ?? 0, tax_amount: params.taxAmount ?? 0, final_amount: params.finalAmount, status: 'pending', expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() }).select('*').single();
    if (error) { logger.error('FinanceService.createPaymentOrder', { error: error.message }); return { data: null, error: error.message }; }
    return { data: this.mapOrder(data), error: null };
  }

  async updateOrderStatus(orderId: string, status: string, gatewayOrderId?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const updates: Record<string, unknown> = { status };
    if (gatewayOrderId) updates.gateway_order_id = gatewayOrderId;
    const { error } = await supabase.from('payment_orders').update(updates).eq('id', orderId);
    if (error) { logger.error('FinanceService.updateOrderStatus', { error: error.message }); return false; }
    return true;
  }

  async createTransaction(params: { orderId: string; purchaseId: string; profileId: string; gateway: GatewayType; gatewayPaymentId: string; gatewaySignature: string; amount: number; currency: string; paymentMethod: string; status: string; verified: boolean; idempotencyKey: string; rawResponse?: Record<string, unknown> }): Promise<PaymentTransaction | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('payment_transactions').insert({ order_id: params.orderId, purchase_id: params.purchaseId, profile_id: params.profileId, gateway: params.gateway, gateway_payment_id: params.gatewayPaymentId, gateway_signature: params.gatewaySignature, amount: params.amount, currency: params.currency, payment_method: params.paymentMethod, status: params.status, verified: params.verified, idempotency_key: params.idempotencyKey, raw_response: params.rawResponse ?? null }).select('*').single();
    if (error) { logger.error('FinanceService.createTransaction', { error: error.message }); return null; }
    return this.mapTransaction(data);
  }

  async logPaymentEvent(params: { profileId?: string; orderId?: string; transactionId?: string; action: string; gateway?: GatewayType; message?: string; level?: string; metadata?: Record<string, unknown> }): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('payment_logs').insert({ profile_id: params.profileId ?? null, order_id: params.orderId ?? null, transaction_id: params.transactionId ?? null, action: params.action, gateway: params.gateway ?? null, message: params.message ?? null, level: params.level ?? 'info', metadata: params.metadata ?? null });
    if (error) logger.error('FinanceService.logPaymentEvent', { error: error.message });
  }

  async getPaymentLogs(limit = 50): Promise<PaymentLog[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('payment_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) { logger.error('FinanceService.getPaymentLogs', { error: error.message }); return []; }
    return (data ?? []).map((r: Record<string, unknown>) => this.mapLog(r));
  }

  async getGatewayWebhooks(limit = 50): Promise<{ id: string; gateway: string; eventType: string; eventId: string | null; signatureVerified: boolean; processed: boolean; createdAt: string }[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('gateway_webhooks').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) { logger.error('FinanceService.getGatewayWebhooks', { error: error.message }); return []; }
    return (data ?? []).map((r: Record<string, unknown>) => ({ id: r.id as string, gateway: r.gateway as string, eventType: r.event_type as string, eventId: r.event_id as string | null, signatureVerified: r.signature_verified as boolean, processed: r.processed as boolean, createdAt: r.created_at as string }));
  }

  async recordWebhook(params: { gateway: GatewayType; eventType: string; eventId: string; payload: Record<string, unknown>; signatureVerified: boolean }): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('gateway_webhooks').insert({ gateway: params.gateway, event_type: params.eventType, event_id: params.eventId, payload: params.payload, signature_verified: params.signatureVerified, processed: true, processed_at: new Date().toISOString() });
    if (error) { logger.error('FinanceService.recordWebhook', { error: error.message }); return false; }
    return true;
  }

  private mapOrder(r: Record<string, unknown>): PaymentOrder { return { id: r.id as string, profileId: r.profile_id as string, batchId: r.batch_id as string, pricingId: r.pricing_id as string, gateway: r.gateway as GatewayType, gatewayOrderId: r.gateway_order_id as string | null, amount: Number(r.amount), currency: r.currency as string, couponCode: r.coupon_code as string | null, couponDiscount: Number(r.coupon_discount ?? 0), taxAmount: Number(r.tax_amount ?? 0), finalAmount: Number(r.final_amount), status: r.status as PaymentOrder['status'], expiresAt: r.expires_at as string | null, createdAt: r.created_at as string, updatedAt: r.updated_at as string }; }
  private mapTransaction(r: Record<string, unknown>): PaymentTransaction { return { id: r.id as string, orderId: r.order_id as string | null, purchaseId: r.purchase_id as string | null, profileId: r.profile_id as string, gateway: r.gateway as GatewayType, gatewayPaymentId: r.gateway_payment_id as string | null, gatewaySignature: r.gateway_signature as string | null, amount: Number(r.amount), currency: r.currency as string, paymentMethod: r.payment_method as string | null, status: r.status as string, verified: r.verified as boolean, idempotencyKey: r.idempotency_key as string | null, rawResponse: r.raw_response as Record<string, unknown> | null, createdAt: r.created_at as string, updatedAt: r.updated_at as string }; }
  private mapLog(r: Record<string, unknown>): PaymentLog { return { id: r.id as string, profileId: r.profile_id as string | null, orderId: r.order_id as string | null, transactionId: r.transaction_id as string | null, action: r.action as string, gateway: r.gateway as GatewayType | null, message: r.message as string | null, level: r.level as string, metadata: r.metadata as Record<string, unknown> | null, ipAddress: r.ip_address as string | null, userAgent: r.user_agent as string | null, createdAt: r.created_at as string }; }
}

export const financeService = new FinanceService();
