import { useProfileDisplayName, useAvatar } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants/routes';

interface StudentSidebarFooterProps { collapsed: boolean; }

export function StudentSidebarFooter({ collapsed }: StudentSidebarFooterProps) {
  const displayName = useProfileDisplayName();
  const avatarUrl = useAvatar();
  const { logout } = useAuth();
  return (
    <div className={cn('border-t border-white/10 p-3', collapsed && 'flex flex-col items-center gap-2')}>
      {!collapsed ? (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-500/30">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-primary-200" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{displayName}</p>
            <Link to={ROUTES.PROFILE} className="text-[10px] text-primary-300 hover:text-white transition-colors">View Profile</Link>
          </div>
          <button onClick={() => void logout()} title="Sign out" className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"><LogOut className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <>
          <Link to={ROUTES.PROFILE} title="Profile" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-500/30 hover:bg-primary-500/50 transition-colors">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-primary-200" />}
          </Link>
          <button onClick={() => void logout()} title="Sign out" className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /></button>
        </>
      )}
    </div>
  );
}
