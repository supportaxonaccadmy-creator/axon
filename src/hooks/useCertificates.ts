import { useState, useEffect, useCallback } from 'react';
import { certificateService } from '@/services/gamification';
import type { Certificate } from '@/services/gamification';

export function useCertificates(studentId: string | null, isAdmin: boolean = false) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    if (isAdmin) {
      const { data, error: err } = await certificateService.getAll();
      if (err) setError(err);
      else { setCertificates(data); setError(null); }
    } else if (studentId) {
      const { data, error: err } = await certificateService.getByStudent(studentId);
      if (err) setError(err);
      else { setCertificates(data); setError(null); }
    }
    setLoading(false);
  }, [studentId, isAdmin]);

  useEffect(() => { void fetchCertificates(); }, [fetchCertificates]);

  const revoke = useCallback(async (id: string) => {
    const { error: err } = await certificateService.revoke(id);
    if (!err) void fetchCertificates();
    return { error: err };
  }, [fetchCertificates]);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await certificateService.delete(id);
    if (!err) void fetchCertificates();
    return { error: err };
  }, [fetchCertificates]);

  return { certificates, loading, error, revoke, remove, refetch: fetchCertificates };
}