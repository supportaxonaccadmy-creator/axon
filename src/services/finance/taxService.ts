import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { TaxSettings, FinanceSettings, CheckoutCalculation, GatewayType } from './finance.types';

class TaxService {
  async getTaxSettings(): Promise<TaxSettings | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('tax_settings').select('*').eq('is_active', true).maybeSingle();
    if (error || !data) return null;
    return { id: data.id as string, taxName: data.tax_name as string, cgstRate: Number(data.cgst_rate), sgstRate: Number(data.sgst_rate), igstRate: Number(data.igst_rate), isInclusive: data.is_inclusive as boolean, isActive: data.is_active as boolean, createdAt: data.created_at as string, updatedAt: data.updated_at as string };
  }
  async updateTaxSettings(id: string, updates: Partial<TaxSettings>): Promise<boolean> {
    const supabase = getSupabaseClient();
    const updateData: Record<string, unknown> = {};
    if (updates.taxName !== undefined) updateData.tax_name = updates.taxName;
    if (updates.cgstRate !== undefined) updateData.cgst_rate = updates.cgstRate;
    if (updates.sgstRate !== undefined) updateData.sgst_rate = updates.sgstRate;
    if (updates.igstRate !== undefined) updateData.igst_rate = updates.igstRate;
    if (updates.isInclusive !== undefined) updateData.is_inclusive = updates.isInclusive;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    const { error } = await supabase.from('tax_settings').update(updateData).eq('id', id);
    if (error) { logger.error('TaxService.updateTaxSettings', { error: error.message }); return false; }
    return true;
  }
  calculateTax(taxableAmount: number, taxSettings: TaxSettings | null, isInterState: boolean): { cgstAmount: number; sgstAmount: number; igstAmount: number; totalTax: number } {
    if (!taxSettings) return { cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalTax: 0 };
    if (isInterState) { const igstAmount = (taxableAmount * taxSettings.igstRate) / 100; return { cgstAmount: 0, sgstAmount: 0, igstAmount: Math.round(igstAmount * 100) / 100, totalTax: Math.round(igstAmount * 100) / 100 }; }
    const cgstAmount = (taxableAmount * taxSettings.cgstRate) / 100;
    const sgstAmount = (taxableAmount * taxSettings.sgstRate) / 100;
    return { cgstAmount: Math.round(cgstAmount * 100) / 100, sgstAmount: Math.round(sgstAmount * 100) / 100, igstAmount: 0, totalTax: Math.round((cgstAmount + sgstAmount) * 100) / 100 };
  }
  calculateCheckout(originalPrice: number, couponDiscount: number, taxSettings: TaxSettings | null, isInterState: boolean): CheckoutCalculation {
    const taxableAmount = originalPrice - couponDiscount;
    const tax = this.calculateTax(taxableAmount, taxSettings, isInterState);
    const finalAmount = taxableAmount + tax.totalTax;
    return { originalPrice, couponDiscount, taxableAmount, cgstAmount: tax.cgstAmount, sgstAmount: tax.sgstAmount, igstAmount: tax.igstAmount, taxAmount: tax.totalTax, finalAmount: Math.round(finalAmount * 100) / 100, currency: 'INR' };
  }
}
export const taxService = new TaxService();

class FinanceSettingsService {
  async getSettings(): Promise<FinanceSettings | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('finance_settings').select('*').eq('is_active', true).maybeSingle();
    if (error || !data) return null;
    return { id: data.id as string, defaultCurrency: data.default_currency as string, invoicePrefix: data.invoice_prefix as string, invoiceStartNumber: data.invoice_start_number as number, primaryGateway: data.primary_gateway as GatewayType, enableWallet: data.enable_wallet as boolean, enableCoupons: data.enable_coupons as boolean, enableRefunds: data.enable_refunds as boolean, autoEnrollOnPayment: data.auto_enroll_on_payment as boolean, autoRevokeOnRefund: data.auto_revoke_on_refund as boolean, successUrl: data.success_url as string | null, cancelUrl: data.cancel_url as string | null, webhookSecret: data.webhook_secret as string | null, isActive: data.is_active as boolean, createdAt: data.created_at as string, updatedAt: data.updated_at as string };
  }
  async updateSettings(id: string, updates: Partial<FinanceSettings>): Promise<boolean> {
    const supabase = getSupabaseClient();
    const updateData: Record<string, unknown> = {};
    if (updates.defaultCurrency !== undefined) updateData.default_currency = updates.defaultCurrency;
    if (updates.invoicePrefix !== undefined) updateData.invoice_prefix = updates.invoicePrefix;
    if (updates.invoiceStartNumber !== undefined) updateData.invoice_start_number = updates.invoiceStartNumber;
    if (updates.primaryGateway !== undefined) updateData.primary_gateway = updates.primaryGateway;
    if (updates.enableWallet !== undefined) updateData.enable_wallet = updates.enableWallet;
    if (updates.enableCoupons !== undefined) updateData.enable_coupons = updates.enableCoupons;
    if (updates.enableRefunds !== undefined) updateData.enable_refunds = updates.enableRefunds;
    if (updates.autoEnrollOnPayment !== undefined) updateData.auto_enroll_on_payment = updates.autoEnrollOnPayment;
    if (updates.autoRevokeOnRefund !== undefined) updateData.auto_revoke_on_refund = updates.autoRevokeOnRefund;
    if (updates.successUrl !== undefined) updateData.success_url = updates.successUrl;
    if (updates.cancelUrl !== undefined) updateData.cancel_url = updates.cancelUrl;
    if (updates.webhookSecret !== undefined) updateData.webhook_secret = updates.webhookSecret;
    const { error } = await supabase.from('finance_settings').update(updateData).eq('id', id);
    if (error) { logger.error('FinanceSettingsService.updateSettings', { error: error.message }); return false; }
    return true;
  }
}
export const financeSettingsService = new FinanceSettingsService();
