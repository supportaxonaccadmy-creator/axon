import { Menu } from 'lucide-react';
import { StudentBreadcrumbs } from './StudentBreadcrumbs';
import { StudentThemeToggle } from './StudentThemeToggle';
import { StudentNotificationButton } from './StudentNotificationButton';
import { StudentUserMenu } from './StudentUserMenu';
import { cn } from '@/utils/cn';

interface StudentHeaderProps { onMobileMenuOpen: () => void; className?: string | undefined; }

export function StudentHeader({ onMobileMenuOpen, className }: StudentHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm lg:px-6', className)}>
      <button onClick={onMobileMenuOpen} aria-label="Open navigation" className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"><Menu className="h-5 w-5" /></button>
      <div className="min-w-0 flex-1"><StudentBreadcrumbs /></div>
      <div className="flex items-center gap-2"><StudentThemeToggle /><StudentNotificationButton /><StudentUserMenu /></div>
    </header>
  );
}
