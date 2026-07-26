import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { cn } from '@/utils/cn';
import { APP_CONFIG } from '@/constants/app';

interface StudentSidebarLogoProps { collapsed: boolean; }

export function StudentSidebarLogo({ collapsed }: StudentSidebarLogoProps) {
  return (
    <Link to="/student" className={cn('flex items-center gap-3 px-3 py-4 transition-all duration-150 hover:opacity-80', collapsed && 'justify-center px-2')}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 shadow-md">
        <Stethoscope className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-white">{APP_CONFIG.shortName}</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-primary-300">Student</p>
        </div>
      )}
    </Link>
  );
}
