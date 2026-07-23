export function FormDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-neutral-200" />
      <span className="text-sm text-neutral-400">{label}</span>
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}
