import { useState, useMemo } from 'react';
import { Award, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CertificateCard, CertificatePreview } from '@/components/gamification';
import { useCertificates } from '@/hooks/useCertificates';
import { useCurrentUser } from '@/hooks/useProfile';
import type { Certificate } from '@/services/gamification';

export function MyCertificatesPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { certificates, loading } = useCertificates(studentId, false);
  const [selected, setSelected] = useState<Certificate | null>(null);

  const activeCerts = useMemo(() => certificates.filter((c) => c.status === 'active'), [certificates]);

  const handleDownload = (cert: Certificate) => {
    setSelected(cert);
    window.print();
  };

  const handleShare = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.verificationCode}`;
    if (navigator.share) {
      void navigator.share({ title: `Certificate - ${cert.studentName}`, url });
    } else {
      void navigator.clipboard.writeText(url);
      alert('Verification link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Certificates</h1>
        <p className="mt-1 text-sm text-neutral-500">View, download, and share your certificates</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : activeCerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="h-10 w-10 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No certificates yet. Complete a course to earn one!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCerts.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onDownload={handleDownload}
                onShare={handleShare}
                onVerify={(c) => { window.open(`/verify/${c.verificationCode}`, '_blank'); }}
              />
            ))}
          </div>

          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
              <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <CertificatePreview certificate={selected} />
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={() => window.print()}><Download className="h-4 w-4" /> Print</Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
