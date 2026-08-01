import { memo, useCallback, useState } from 'react';
import { QrCode } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VerificationCard } from './VerificationCard';
import { certificateVerificationService } from '@/services/gamification';
import type { Certificate } from '@/services/gamification';

interface QRVerificationProps {
  className?: string | undefined;
}

function QRVerificationComponent({ className }: QRVerificationProps) {
  const [code, setCode] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await certificateVerificationService.verify(code.trim().toUpperCase());
    if (err) { setError(err); setCertificate(null); }
    else { setCertificate(data); setError(null); }
    setLoading(false);
  }, [code]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
            <QrCode className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Verify Certificate</h2>
            <p className="text-xs text-neutral-500">Enter the verification code to check authenticity</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code..."
            className="flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') void handleVerify(); }}
          />
          <Button onClick={handleVerify} loading={loading} disabled={!code.trim()}>
            Verify
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-error-600">{error}</p>}
      </div>

      {certificate && <VerificationCard certificate={certificate} />}
    </div>
  );
}

export const QRVerification = memo(QRVerificationComponent);
