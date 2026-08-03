import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { StudentInsightCard } from '@/components/analytics';
import { studentAnalyticsService } from '@/services/analytics';
import type { StudentIntelligence } from '@/services/analytics';

export function StudentIntelligencePage() {
  const [students, setStudents] = useState<StudentIntelligence[]>([]);
  const [filtered, setFiltered] = useState<StudentIntelligence[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const { data } = await studentAnalyticsService.getAllIntelligence(); setStudents(data); setFiltered(data); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const handleSearch = useCallback((value: string) => { setSearch(value); setFiltered(students.filter((s) => s.fullName.toLowerCase().includes(value.toLowerCase()) || s.email.toLowerCase().includes(value.toLowerCase()))); }, [students]);
  return (
    <PageContainer>
      <SectionHeader title="Student Intelligence" description="AI-powered student insights and predictions" />
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"><Search className="h-4 w-4 text-neutral-400" /><input type="text" placeholder="Search students..." value={search} onChange={(e) => handleSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-neutral-700 outline-none" /></div>
      {loading ? <div className="flex h-64 items-center justify-center text-neutral-400">Loading student intelligence...</div> : filtered.length === 0 ? <div className="flex h-64 items-center justify-center text-neutral-400">No students found</div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map((s) => <StudentInsightCard key={s.studentId} insight={s} />)}</div>}
    </PageContainer>
  );
}
