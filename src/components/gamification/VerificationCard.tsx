import { memo } from 'react';
import { Award, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CERTIFICATE_TYPE_LABELS, formatDate } from '@/services/gamification';
import type { Certificate } from '@/services/gamification';

interface VerificationCardProps {
  certificate: Certificate;
  className?: string | undefined;
}

function VerificationCardComponent({ certificate, className }: VerificationCardProps) {
  const isValid = certificate.status === 'active';

  return (
    <div className={cn('overflow-hidden rounded-xl border-2 bg-white shadow-lg', isValid ? 'border-green-200' : 'border-red-200', className)}>
      <div className={cn('flex items-center justify-center gap-2 py-3', isValid ? 'bg-green-50' : 'bg-red-50')}>
        {isValid ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
        <span className={cn('text-sm font-semibold', isValid ? 'text-green-700' : 'text-red-700')}>
          {isValid ? 'Certificate Verified' : 'Certificate Invalid'}
        </span>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-center">
          <Award className="h-16 w-16 text-primary-400" />
        </div>

        <h2 className="text-center text-xl font-bold text-neutral-900">{certificate.studentName}</h2>
        <p className="mt-1 text-center text-sm text-neutral-500">{CERTIFICATE_TYPE_LABELS[certificate.type]}</p>

        {certificate.courseName && <p className="mt-2 text-center text-sm font-medium text-neutral-700">{certificate.courseName}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-500">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(certificate.completionDate)}
          </div>
          {certificate.instructorName && (
            <div className="flex items-center gap-2 text-neutral-500">
              <User className="h-3.5 w-3.5" /> {certificate.instructorName}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-3 text-center">
          <p className="text-[10px] text-neutral-400">Certificate Number</p>
          <p className="font-mono text-sm font-medium text-neutral-700">{certificate.certificateNumber}</p>
        </div>
      </div>
    </div>
  );
}

export const VerificationCard = memo(VerificationCardComponent);
