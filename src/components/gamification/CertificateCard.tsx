import { memo } from 'react';
import { Award, Download, Share2, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CertificateStatusBadge } from './CertificateStatusBadge';
import { CERTIFICATE_TYPE_LABELS, formatDate } from '@/services/gamification';
import type { Certificate } from '@/services/gamification';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (cert: Certificate) => void;
  onShare?: (cert: Certificate) => void;
  onVerify?: (cert: Certificate) => void;
  className?: string | undefined;
}

function CertificateCardComponent({ certificate, onDownload, onShare, onVerify, className }: CertificateCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md', className)}>
      <div className="flex items-center gap-3 border-b border-neutral-100 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          <Award className="h-5 w-5 text-primary-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-neutral-900">{certificate.studentName}</h3>
          <p className="text-xs text-neutral-500">{CERTIFICATE_TYPE_LABELS[certificate.type]}</p>
        </div>
        <CertificateStatusBadge status={certificate.status} />
      </div>

      <div className="p-4">
        <div className="space-y-1.5 text-xs text-neutral-500">
          <p><span className="font-medium text-neutral-700">Certificate #:</span> {certificate.certificateNumber}</p>
          {certificate.courseName && <p><span className="font-medium text-neutral-700">Course:</span> {certificate.courseName}</p>}
          {certificate.batchName && <p><span className="font-medium text-neutral-700">Batch:</span> {certificate.batchName}</p>}
          {certificate.instructorName && <p><span className="font-medium text-neutral-700">Instructor:</span> {certificate.instructorName}</p>}
          <p><span className="font-medium text-neutral-700">Completed:</span> {formatDate(certificate.completionDate)}</p>
          {certificate.expiryDate && <p><span className="font-medium text-neutral-700">Expires:</span> {formatDate(certificate.expiryDate)}</p>}
        </div>

        {certificate.status === 'active' && (
          <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
            {onDownload && (
              <button onClick={() => onDownload(certificate)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary-600 hover:bg-primary-50">
                <Download className="h-3 w-3" /> Download
              </button>
            )}
            {onShare && (
              <button onClick={() => onShare(certificate)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">
                <Share2 className="h-3 w-3" /> Share
              </button>
            )}
            {onVerify && (
              <button onClick={() => onVerify(certificate)} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">
                <Eye className="h-3 w-3" /> Verify
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const CertificateCard = memo(CertificateCardComponent);
