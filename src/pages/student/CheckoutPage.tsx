import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileContext } from '@/contexts/ProfileContext';
import { batchService } from '@/services/lms/batchService';
import { pricingService } from '@/services/lms/pricingService';
import { usePayment } from '@/hooks/usePayment';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PaymentLoader } from '@/components/student/payment';
import { OrderSummary, CouponCard, PaymentSummaryCard } from '@/components/student/payment';
import { formatCurrency } from '@/services/payment/paymentHelpers';
import type { Batch, BatchPricing } from '@/types/lms';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { batchSlug } = useParams<{ batchSlug: string }>();
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [pricing, setPricing] = useState<BatchPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchSlug) { setError('No batch specified'); setLoading(false); return; }
    (async () => {
      try {
        const { data: batchData, error: batchError } = await batchService.getBySlug(batchSlug);
        if (batchError || !batchData) { setError(batchError ?? 'Batch not found'); setLoading(false); return; }
        setBatch(batchData);
        const { data: pricingData } = await pricingService.getByBatchId(batchData.id);
        setPricing(pricingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load batch');
      } finally {
        setLoading(false);
      }
    })();
  }, [batchSlug]);

  const payment = usePayment({
    profileId: user?.id ?? '',
    batchId: batch?.id ?? '',
    batchTitle: batch?.title ?? '',
    batchSlug: batchSlug ?? '',
    pricingId: pricing?.id ?? '',
    originalPrice: pricing?.price ?? 0,
    salePrice: pricing?.salePrice ?? null,
    currency: pricing?.currency ?? 'INR',
    isFree: pricing?.isFree ?? false,
    studentName: profile?.fullName ?? '',
    studentEmail: profile?.email ?? user?.email ?? '',
    studentMobile: profile?.mobile ?? '',
  });

  const handleBuyNow = useCallback(() => {
    payment.startPayment({
      onSuccess: (result) => {
        navigate('/student/payment/success', { state: { result, batchSlug, amount: payment.checkoutSummary.finalAmount, currency: payment.checkoutSummary.currency } });
      },
      onFailure: (err) => {
        navigate('/student/payment/failure', { state: { error: err, batchSlug } });
      },
    });
  }, [payment, navigate, batchSlug]);

  if (loading) return <PaymentLoader message="Loading checkout..." />;
  if (error) return <Alert variant="error" title="Error">{error}</Alert>;
  if (!batch || !pricing) return <Alert variant="error" title="Error">Batch or pricing information not available.</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/student/batches/${batchSlug}`)}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
      </div>
      {payment.loading && <PaymentLoader message="Processing your payment..." />}
      {payment.error && <Alert variant="error" title="Payment Error">{payment.error}</Alert>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <OrderSummary summary={payment.checkoutSummary} batchTitle={batch.title} />
          {!payment.checkoutSummary.isFree && payment.checkoutSummary.finalAmount > 0 && (
            <CouponCard couponCode={payment.couponCode} appliedCoupon={payment.appliedCoupon} onApply={payment.applyCoupon} onRemove={payment.removeCoupon} finalAmount={payment.checkoutSummary.finalAmount} />
          )}
          <div className="flex items-start gap-2 rounded-lg bg-neutral-50 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success-600" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Secure Payment</p>
              <p className="text-xs text-neutral-500">Your payment is secured with 256-bit SSL encryption. We never store your card details.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-neutral-50 p-4">
            <Lock className="h-5 w-5 shrink-0 text-primary-600" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Terms & Conditions</p>
              <p className="text-xs text-neutral-500">By proceeding, you agree to our refund policy. Access is granted immediately after successful payment. {pricing.lifetimeAccess ? 'This purchase includes lifetime access.' : pricing.accessDurationDays ? `Access duration: ${pricing.accessDurationDays} days.` : ''}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <PaymentSummaryCard summary={payment.checkoutSummary} />
          <Button className="w-full" size="lg" onClick={handleBuyNow} disabled={payment.loading} loading={payment.loading}>
            {payment.checkoutSummary.isFree ? 'Enroll for Free' : `Pay ${formatCurrency(payment.checkoutSummary.finalAmount, payment.checkoutSummary.currency)}`}
          </Button>
          <p className="text-center text-xs text-neutral-400">By clicking {payment.checkoutSummary.isFree ? 'Enroll' : 'Pay'}, you agree to our terms and conditions.</p>
        </div>
      </div>
    </div>
  );
}
