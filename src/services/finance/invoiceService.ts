import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Invoice, InvoiceItem, GatewayType } from './finance.types';

class InvoiceService {
  async generateInvoiceNumber(): Promise<string> {
    const supabase = getSupabaseClient();
    const { data: settings } = await supabase.from('finance_settings').select('invoice_prefix, invoice_start_number').maybeSingle();
    const prefix = settings?.invoice_prefix ?? 'INV';
    const startNum = settings?.invoice_start_number ?? 1;
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
    const num = startNum + (count ?? 0);
    return `${prefix}-${new Date().getFullYear()}-${String(num).padStart(5, '0')}`;
  }
  async createInvoice(params: { profileId: string; purchaseId?: string; batchId?: string; studentName: string; studentEmail?: string; studentPhone?: string; studentAddress?: string; studentGstin?: string; batchTitle: string; batchDescription?: string; originalAmount: number; discountAmount: number; taxableAmount: number; cgstRate: number; cgstAmount: number; sgstRate: number; sgstAmount: number; igstRate: number; igstAmount: number; totalAmount: number; currency: string; gateway?: GatewayType; transactionId?: string; notes?: string }): Promise<Invoice | null> {
    const supabase = getSupabaseClient();
    const invoiceNumber = await this.generateInvoiceNumber();
    const { data, error } = await supabase.from('invoices').insert({ invoice_number: invoiceNumber, profile_id: params.profileId, purchase_id: params.purchaseId ?? null, batch_id: params.batchId ?? null, student_name: params.studentName, student_email: params.studentEmail ?? null, student_phone: params.studentPhone ?? null, student_address: params.studentAddress ?? null, student_gstin: params.studentGstin ?? null, batch_title: params.batchTitle, original_amount: params.originalAmount, discount_amount: params.discountAmount, taxable_amount: params.taxableAmount, cgst_rate: params.cgstRate, cgst_amount: params.cgstAmount, sgst_rate: params.sgstRate, sgst_amount: params.sgstAmount, igst_rate: params.igstRate, igst_amount: params.igstAmount, total_amount: params.totalAmount, currency: params.currency, gateway: params.gateway ?? null, transaction_id: params.transactionId ?? null, status: 'generated', notes: params.notes ?? null }).select('*').single();
    if (error) { logger.error('InvoiceService.createInvoice', { error: error.message }); return null; }
    return this.mapInvoice(data);
  }
  async addInvoiceItem(invoiceId: string, description: string, quantity: number, unitPrice: number): Promise<InvoiceItem | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('invoice_items').insert({ invoice_id: invoiceId, description, quantity, unit_price: unitPrice, total_price: quantity * unitPrice }).select('*').single();
    if (error) { logger.error('InvoiceService.addInvoiceItem', { error: error.message }); return null; }
    return { id: data.id as string, invoiceId: data.invoice_id as string, description: data.description as string, quantity: data.quantity as number, unitPrice: Number(data.unit_price), totalPrice: Number(data.total_price), createdAt: data.created_at as string };
  }
  async getInvoices(profileId?: string, limit = 50): Promise<Invoice[]> {
    const supabase = getSupabaseClient();
    let query = supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(limit);
    if (profileId) query = query.eq('profile_id', profileId);
    const { data, error } = await query;
    if (error) { logger.error('InvoiceService.getInvoices', { error: error.message }); return []; }
    return (data ?? []).map((r: Record<string, unknown>) => this.mapInvoice(r));
  }
  async getInvoiceById(id: string): Promise<Invoice | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return this.mapInvoice(data);
  }
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId);
    if (error) return [];
    return (data ?? []).map((r: Record<string, unknown>) => ({ id: r.id as string, invoiceId: r.invoice_id as string, description: r.description as string, quantity: r.quantity as number, unitPrice: Number(r.unit_price), totalPrice: Number(r.total_price), createdAt: r.created_at as string }));
  }
  async updateInvoiceStatus(id: string, status: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (error) { logger.error('InvoiceService.updateInvoiceStatus', { error: error.message }); return false; }
    return true;
  }
  private mapInvoice(r: Record<string, unknown>): Invoice { return { id: r.id as string, invoiceNumber: r.invoice_number as string, profileId: r.profile_id as string, purchaseId: r.purchase_id as string | null, batchId: r.batch_id as string | null, studentName: r.student_name as string, studentEmail: r.student_email as string | null, studentPhone: r.student_phone as string | null, studentAddress: r.student_address as string | null, studentGstin: r.student_gstin as string | null, batchTitle: r.batch_title as string, originalAmount: Number(r.original_amount), discountAmount: Number(r.discount_amount ?? 0), taxableAmount: Number(r.taxable_amount), cgstRate: Number(r.cgst_rate ?? 0), cgstAmount: Number(r.cgst_amount ?? 0), sgstRate: Number(r.sgst_rate ?? 0), sgstAmount: Number(r.sgst_amount ?? 0), igstRate: Number(r.igst_rate ?? 0), igstAmount: Number(r.igst_amount ?? 0), totalAmount: Number(r.total_amount), currency: r.currency as string, gateway: r.gateway as GatewayType | null, transactionId: r.transaction_id as string | null, status: r.status as Invoice['status'], notes: r.notes as string | null, createdAt: r.created_at as string, updatedAt: r.updated_at as string }; }
}
export const invoiceService = new InvoiceService();
