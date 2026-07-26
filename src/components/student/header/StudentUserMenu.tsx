import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useProfileDisplayName, useAvatar } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

export function StudentUserMenu() {
  const [open, setOpen] = useState(false);
  const displayName = useProfileDisplayName();
  const avatarUrl = useAvatar();
  const { logout } = useAuth();
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className={cn('flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 transition-colors hover:bg-neutral-50', open && 'bg-neutral-50')}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">{avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : <User className="h-3.5 w-3.5 text-primary-600" />}</div>
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-neutral-700 sm:block">{displayName}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-neutral-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg animate-fade-in">
            <div className="border-b border-neutral-100 px-4 py-3"><p className="truncate text-sm font-semibold text-neutral-800">{displayName}</p><p className="text-xs text-neutral-400">Student</p></div>
            <div className="py-1">
              <Link to={ROUTES.PROFILE} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"><Settings className="h-4 w-4 text-neutral-400" />Settings</Link>
              <button onClick={() => { setOpen(false); void logout(); }} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"><LogOut className="h-4 w-4" />Sign Out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
