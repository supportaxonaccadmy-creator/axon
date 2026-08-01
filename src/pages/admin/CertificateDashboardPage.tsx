import { useState, useEffect, useMemo } from 'react';
import { Award, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { certificateService } from '@/services/gamification';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '@/services/gamification';
import type { Certificate } from '@/services/gamification';

export function CertificateDashboardPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, expired: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await certificateService.getAll(20);
      setCertificates(data);
      const { data: statsData } = await certificateService.getStats();
      setStats(statsData);
      setLoading(false);
    };
    void fetch();
  }, []);

  const statCards = useMemo(() => [
    { label: 'Total Certificates', value: stats.total, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Revoked', value: stats.revoked, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Expired', value: stats.expired, icon: FileText, color: 'text-neutral-400', bg: 'bg-neutral-50' },
  ], [stats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Certificate Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage student certificates</p>
        </div>
        <Button onClick={() => navigate('/admin/certificate-templates')}>
          <FileText className="h-4 w-4" /> Templates
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Certificates</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>
          ) : certificates.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">No certificates issued yet</div>
          ) : (
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                  <Award className="h-5 w-5 text-primary-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{cert.studentName}</p>
                    <p className="text-xs text-neutral-400">{cert.certificateNumber} · {formatRelativeTime(cert.createdAt)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/certificates/${cert.id}`)}>View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
