import { Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { QRVerification } from '@/components/gamification';

export function CertificateVerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Certificate Verification</h1>
        <p className="mt-1 text-sm text-neutral-500">Verify the authenticity of a certificate</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Award className="h-12 w-12 text-primary-300" />
          <p className="mt-2 text-sm text-neutral-500">Enter the verification code from the certificate to check its validity.</p>
        </CardContent>
      </Card>

      <QRVerification />
    </div>
  );
}
