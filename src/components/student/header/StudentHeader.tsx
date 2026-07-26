import { Menu } from 'lucide-react';
import { StudentBreadcrumbs } from './StudentBreadcrumbs';
import { StudentThemeToggle } from './StudentThemeToggle';
import { StudentUserMenu } from './StudentUserMenu';
import { GlobalSearch } from '@/components/student/common/GlobalSearch';
import { NotificationPanel } from '@/components/student/common/NotificationPanel';
import { cn } from '@/utils/cn';

interface StudentHeaderProps { onMobileMenuOpen: () => void; className?: string | undefined; }

export function StudentHeader({ onMobileMenuOpen, className }: StudentHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm lg:px-6', className)}>
      <button onClick={onMobileMenuOpen} aria-label="Open navigation" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"><Menu className="h-5 w-5" /></button>
      <div className="hidden min-w-0 flex-1 lg:block"><StudentBreadcrumbs /></div>
      <div className="flex min-w-0 flex-1 justify-center lg:max-w-md lg:flex-initial lg:justify-start"><GlobalSearch /></div>
      <div className="flex items-center gap-2"><StudentThemeToggle /><NotificationPanel /><StudentUserMenu /></div>
    </header>
  );
}
