import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { WalletAccount, WalletTransaction, WalletTxType } from './finance.types';

class WalletService {
  async getOrCreateWallet(profileId: string): Promise<WalletAccount | null> {
    const supabase = getSupabaseClient();
    const { data: existing } = await supabase.from('wallet_accounts').select('*').eq('profile_id', profileId).maybeSingle();
    if (existing) return this.mapWallet(existing);
    const { data, error } = await supabase.from('wallet_accounts').insert({ profile_id: profileId, balance: 0, currency: 'INR' }).select('*').single();
    if (error) { logger.error('WalletService.getOrCreateWallet', { error: error.message }); return null; }
    return this.mapWallet(data);
  }
  async getWallet(profileId: string): Promise<WalletAccount | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('wallet_accounts').select('*').eq('profile_id', profileId).maybeSingle();
    if (error || !data) return null;
    return this.mapWallet(data);
  }
  async recharge(profileId: string, amount: number, description?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const wallet = await this.getOrCreateWallet(profileId);
    if (!wallet) return false;
    const newBalance = wallet.balance + amount;
    const { error: updateError } = await supabase.from('wallet_accounts').update({ balance: newBalance }).eq('id', wallet.id);
    if (updateError) { logger.error('WalletService.recharge', { error: updateError.message }); return false; }
    const { error: txError } = await supabase.from('wallet_transactions').insert({ wallet_id: wallet.id, profile_id: profileId, type: 'credit', amount, balance_after: newBalance, description: description ?? 'Wallet recharge', reference_type: 'recharge' });
    if (txError) logger.error('WalletService.recharge:tx', { error: txError.message });
    return true;
  }
  async debit(profileId: string, amount: number, description: string, referenceType?: string, referenceId?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const wallet = await this.getWallet(profileId);
    if (!wallet || wallet.balance < amount) return false;
    const newBalance = wallet.balance - amount;
    const { error: updateError } = await supabase.from('wallet_accounts').update({ balance: newBalance }).eq('id', wallet.id);
    if (updateError) { logger.error('WalletService.debit', { error: updateError.message }); return false; }
    const { error: txError } = await supabase.from('wallet_transactions').insert({ wallet_id: wallet.id, profile_id: profileId, type: 'debit', amount, balance_after: newBalance, description, reference_type: referenceType ?? 'payment', reference_id: referenceId ?? null });
    if (txError) logger.error('WalletService.debit:tx', { error: txError.message });
    return true;
  }
  async refundToWallet(profileId: string, amount: number, _refundId: string): Promise<boolean> { return this.recharge(profileId, amount, `Refund credited to wallet`); }
  async getTransactions(profileId: string, limit = 50): Promise<WalletTransaction[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('wallet_transactions').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(limit);
    if (error) { logger.error('WalletService.getTransactions', { error: error.message }); return []; }
    return (data ?? []).map((r: Record<string, unknown>) => ({ id: r.id as string, walletId: r.wallet_id as string, profileId: r.profile_id as string, type: r.type as WalletTxType, amount: Number(r.amount), balanceAfter: Number(r.balance_after), description: r.description as string | null, referenceType: r.reference_type as string | null, referenceId: r.reference_id as string | null, createdAt: r.created_at as string }));
  }
  async getWalletAnalytics(profileId?: string): Promise<{ totalRecharged: number; totalSpent: number; currentBalance: number; transactionCount: number }> {
    const supabase = getSupabaseClient();
    let txQuery = supabase.from('wallet_transactions').select('amount, type');
    if (profileId) txQuery = txQuery.eq('profile_id', profileId);
    const { data: txs } = await txQuery;
    const rows = txs ?? [];
    const totalRecharged = rows.filter((t: Record<string, unknown>) => t.type === 'credit').reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.amount), 0);
    const totalSpent = rows.filter((t: Record<string, unknown>) => t.type === 'debit').reduce((sum: number, t: Record<string, unknown>) => sum + Number(t.amount), 0);
    let currentBalance = 0;
    if (profileId) { const wallet = await this.getWallet(profileId); currentBalance = wallet?.balance ?? 0; }
    return { totalRecharged, totalSpent, currentBalance, transactionCount: rows.length };
  }
  private mapWallet(r: Record<string, unknown>): WalletAccount { return { id: r.id as string, profileId: r.profile_id as string, balance: Number(r.balance), currency: r.currency as string, isActive: r.is_active as boolean, createdAt: r.created_at as string, updatedAt: r.updated_at as string }; }
}
export const walletService = new WalletService();
