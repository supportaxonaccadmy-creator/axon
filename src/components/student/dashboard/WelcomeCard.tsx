import { memo } from 'react';
import { Stethoscope } from 'lucide-react';
import { useProfileDisplayName } from '@/hooks/useProfile';
import { format } from 'date-fns';

function WelcomeCardComponent() {
  const displayName = useProfileDisplayName();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary-200 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 shadow-sm">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-200">{greeting}</p>
          <h1 className="mt-0.5 text-xl font-bold text-white">{displayName}</h1>
          <p className="mt-1 text-sm text-primary-200">{format(new Date(), "EEEE, MMMM d, yyyy")} &mdash; Student Dashboard</p>
        </div>
        <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10"><Stethoscope className="h-7 w-7 text-white" strokeWidth={1.5} /></div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />
    </div>
  );
}

export const WelcomeCard = memo(WelcomeCardComponent);
