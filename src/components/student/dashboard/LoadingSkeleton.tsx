export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-xl border border-neutral-200 bg-white animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-32 rounded-xl border border-neutral-200 bg-white animate-pulse" />))}</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="h-64 rounded-xl border border-neutral-200 bg-white animate-pulse" /><div className="h-64 rounded-xl border border-neutral-200 bg-white animate-pulse" /></div>
    </div>
  );
}

export function SectionLoadingSkeleton({ count = 3 }: { count?: number | undefined }) {
  return (
    <div className="space-y-3">{Array.from({ length: count }).map((_, i) => (<div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />))}</div>
  );
}
