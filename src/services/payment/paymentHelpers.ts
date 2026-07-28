import type { CheckoutSummary, CouponInfo } from '@/types/payment';
import { GST_RATE } from '@/constants/payment';

export function calculateCheckout(params: {
  originalPrice: number;
  salePrice: number | null;
  couponCode: string | null;
  couponInfo: CouponInfo | null;
  currency: string;
  isFree: boolean;
}): CheckoutSummary {
  const { originalPrice, salePrice, couponCode, couponInfo, currency, isFree } = params;
  if (isFree) {
    return {
      batchId: '', batchTitle: '', batchSlug: '', pricingId: '',
      originalPrice: 0, salePrice: 0, discountAmount: 0, couponCode: null, couponDiscount: 0,
      gstAmount: 0, finalAmount: 0, currency, isFree: true,
    };
  }
  const effectivePrice = salePrice ?? originalPrice;
  const discountAmount = originalPrice - effectivePrice;
  let couponDiscount = 0;
  if (couponInfo && couponCode) {
    if (couponInfo.discountType === 'percentage') {
      couponDiscount = Math.round((effectivePrice * couponInfo.discountValue) / 100);
      if (couponInfo.maxDiscount !== null) couponDiscount = Math.min(couponDiscount, couponInfo.maxDiscount);
    } else {
      couponDiscount = couponInfo.discountValue;
    }
    if (couponInfo.minOrderAmount !== null && effectivePrice < couponInfo.minOrderAmount) {
      couponDiscount = 0;
    }
  }
  const afterCoupon = Math.max(0, effectivePrice - couponDiscount);
  const gstAmount = Math.round(afterCoupon * GST_RATE);
  const finalAmount = afterCoupon + gstAmount;
  return {
    batchId: '', batchTitle: '', batchSlug: '', pricingId: '',
    originalPrice, salePrice: effectivePrice, discountAmount, couponCode, couponDiscount,
    gstAmount, finalAmount, currency, isFree: false,
  };
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function generateInvoiceNumber(purchaseId: string): string {
  const prefix = 'INV';
  const datePart = new Date().getFullYear().toString().slice(-2);
  const idPart = purchaseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
  return `${prefix}${datePart}${idPart}`;
}

export function isRazorpayLoaded(): boolean {
  return typeof window !== 'undefined' && typeof (window as unknown as { Razorpay?: unknown }).Razorpay !== 'undefined';
}

export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isRazorpayLoaded()) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
}

export function getPaymentMethodLabel(method: string | null): string {
  if (!method) return '—';
  const labels: Record<string, string> = {
    card: 'Credit/Debit Card', upi: 'UPI', netbanking: 'Net Banking',
    wallet: 'Wallet', emi: 'EMI', paylater: 'Pay Later', cash: 'Cash',
    'bank-transfer': 'Bank Transfer', manual: 'Manual',
  };
  return labels[method] ?? method;
}
