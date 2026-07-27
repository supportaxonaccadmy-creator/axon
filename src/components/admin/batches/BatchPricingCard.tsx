import { memo, useMemo } from 'react';
import { IndianRupee, Clock, Infinity as InfinityIcon } from 'lucide-react';
import type { BatchPricing } from '@/types/lms';

interface BatchPricingCardProps { pricing: BatchPricing | null; loading?: boolean; }

function BatchPricingCardComponent({ pricing, loading = false }: BatchPricingCardProps) {
  const discountPct = useMemo(() => {
    if (!pricing || pricing.isFree || pricing.salePrice === null || pricing.price <= 0) return null;
    return Math.round(((pricing.price - pricing.salePrice) / pricing.price) * 100);
  }, [pricing]);

  if (loading) return <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-800">Pricing Information</h3>
      {pricing ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Original Price</span><span className="flex items-center text-sm font-bold text-neutral-900"><IndianRupee className="h-3.5 w-3.5" />{pricing.price.toLocaleString('en-IN')}</span></div>
          {pricing.salePrice !== null && (
            <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Sale Price</span><div className="flex items-center gap-2"><span className="flex items-center text-sm font-bold text-success-600"><IndianRupee className="h-3.5 w-3.5" />{pricing.salePrice.toLocaleString('en-IN')}</span>{discountPct && <span className="rounded bg-success-100 px-1.5 py-0.5 text-[10px] font-medium text-success-700">{discountPct}% off</span>}</div></div>
          )}
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Currency</span><span className="text-sm font-medium text-neutral-900">{pricing.currency}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Free Access</span><span className={`text-sm font-medium ${pricing.isFree ? 'text-success-600' : 'text-neutral-900'}`}>{pricing.isFree ? 'Yes' : 'No'}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Lifetime Access</span><span className={`flex items-center gap-1 text-sm font-medium ${pricing.lifetimeAccess ? 'text-primary-600' : 'text-neutral-900'}`}>{pricing.lifetimeAccess ? <><InfinityIcon className="h-3.5 w-3.5" />Lifetime</> : 'Limited'}</span></div>
          {!pricing.lifetimeAccess && pricing.accessDurationDays !== null && (
            <div className="flex items-center justify-between"><span className="text-sm text-neutral-500">Access Duration</span><span className="flex items-center gap-1 text-sm font-medium text-neutral-900"><Clock className="h-3.5 w-3.5" />{pricing.accessDurationDays} days</span></div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">No pricing configured for this batch.</p>
      )}
    </div>
  );
}

export const BatchPricingCard = memo(BatchPricingCardComponent);
