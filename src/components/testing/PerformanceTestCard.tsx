import { memo, useState, useEffect, useCallback } from 'react';
import { Gauge, Loader } from 'lucide-react';
import { usePerformanceTests } from '@/hooks/usePerformanceTests';

function PerformanceTestCardComponent() {
  const { metrics, lighthouseScores, bundleAnalysis, loading, runPerformanceTests } = usePerformanceTests();
  const [hasRun, setHasRun] = useState(false);
  const handleRun = useCallback(() => { runPerformanceTests(); setHasRun(true); }, [runPerformanceTests]);
  useEffect(() => { if (!hasRun) handleRun(); }, [hasRun, handleRun]);
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><Gauge className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">Performance Tests</h3></div><button onClick={handleRun} disabled={loading} className="flex items-center gap-1 rounded-lg border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-50">{loading ? <Loader className="h-3 w-3 animate-spin" /> : null} Refresh</button></div>
      {lighthouseScores.length > 0 && (<div className="mb-4 grid grid-cols-4 gap-2">{lighthouseScores.map((score) => (<div key={score.category} className="rounded-lg bg-neutral-50 p-2.5 text-center"><p className={`text-lg font-bold ${score.score >= 95 ? 'text-success-700' : 'text-warning-700'}`}>{score.score}</p><p className="text-xs text-neutral-400">{score.category}</p></div>))}</div>)}
      <div className="space-y-1.5">{metrics.map((metric) => (<div key={metric.name} className="flex items-center justify-between text-xs"><span className="text-neutral-600">{metric.name}</span><div className="flex items-center gap-2"><span className="font-mono text-neutral-400">{metric.value}{metric.unit}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${metric.status === 'pass' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>{metric.status}</span></div></div>))}</div>
      {bundleAnalysis.length > 0 && (<div className="mt-4"><h4 className="mb-2 text-xs font-semibold text-neutral-500">Bundle Analysis</h4><div className="space-y-1">{bundleAnalysis.map((b) => (<div key={b.chunk} className="flex items-center justify-between text-xs"><span className="text-neutral-600">{b.chunk}</span><span className="font-mono text-neutral-400">{b.size} ({b.gzipSize} gzip)</span></div>))}</div></div>)}
    </div>
  );
}
export const PerformanceTestCard = memo(PerformanceTestCardComponent);
