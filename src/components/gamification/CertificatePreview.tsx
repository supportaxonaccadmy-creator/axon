import { memo } from 'react';
import { Award, Calendar, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/services/gamification';
import type { Certificate } from '@/services/gamification';

interface CertificatePreviewProps {
  certificate: Certificate;
  className?: string | undefined;
}

function CertificatePreviewComponent({ certificate, className }: CertificatePreviewProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50 p-8', className)}>
      <div className="absolute right-4 top-4 opacity-10">
        <Award className="h-24 w-24 text-primary-500" />
      </div>

      <div className="relative z-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Certificate of Completion</p>
        <h2 className="mt-4 text-2xl font-bold text-neutral-900">{certificate.studentName}</h2>
        <p className="mt-2 text-sm text-neutral-500">has successfully completed</p>
        <p className="mt-2 text-lg font-semibold text-neutral-800">{certificate.courseName ?? certificate.batchName ?? 'the course'}</p>

        {certificate.instructorName && (
          <p className="mt-4 text-xs text-neutral-500">Instructor: {certificate.instructorName}</p>
        )}

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex flex-col items-center gap-1">
            <Calendar className="h-4 w-4 text-primary-400" />
            <span>{formatDate(certificate.completionDate)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <User className="h-4 w-4 text-primary-400" />
            <span>{certificate.instructorName ?? 'Instructor'}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-primary-200 pt-4">
          <p className="text-[10px] text-neutral-400">Certificate No: {certificate.certificateNumber}</p>
          <p className="text-[10px] text-neutral-400">Verification Code: {certificate.verificationCode}</p>
        </div>
      </div>
    </div>
  );
}

export const CertificatePreview = memo(CertificatePreviewComponent);
