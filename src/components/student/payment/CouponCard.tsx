import { memo, useState, useCallback } from 'react';
import { Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CouponInfo } from '@/types/payment';

interface CouponCardProps {
  couponCode: string;
  appliedCoupon: CouponInfo | null;
  onApply: (code: string, couponInfo: CouponInfo | null) => void;
  onRemove: () => void;
  finalAmount: number;
}

function CouponCardComponent({ couponCode, appliedCoupon, onApply, onRemove, finalAmount }: CouponCardProps) {
  const [code, setCode] = useState(couponCode);

  const handleApply = useCallback(() => {
    if (!code.trim()) return;
    const mockCoupon: CouponInfo | null = code.toUpperCase() === 'WELCOME10'
      ? { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, maxDiscount: 500, minOrderAmount: 1000, expiresAt: null }
      : code.toUpperCase() === 'FLAT200'
        ? { code: 'FLAT200', discountType: 'fixed', discountValue: 200, maxDiscount: null, minOrderAmount: 1000, expiresAt: null }
        : null;
    onApply(code.toUpperCase(), mockCoupon);
  }, [code, onApply]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-neutral-900">Have a Coupon Code?</h3>
      </div>
      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-lg bg-success-50 p-3">
          <div>
            <p className="text-sm font-medium text-success-700">{appliedCoupon.code}</p>
            <p className="text-xs text-success-600">{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `₹${appliedCoupon.discountValue} off`}</p>
          </div>
          <button type="button" onClick={onRemove} aria-label="Remove coupon" className="text-neutral-400 hover:text-error-600"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input placeholder="Enter coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="flex-1" />
          <Button variant="outline" onClick={handleApply} disabled={!code.trim() || finalAmount === 0}>Apply</Button>
        </div>
      )}
      {!appliedCoupon && (
        <p className="mt-2 text-xs text-neutral-400">Try: WELCOME10 (10% off) or FLAT200 (₹200 off, min ₹1000)</p>
      )}
    </div>
  );
}

export const CouponCard = memo(CouponCardComponent);
