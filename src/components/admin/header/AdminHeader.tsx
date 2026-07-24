import { Menu } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationButton } from './NotificationButton';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { cn } from '@/utils/cn';

interface AdminHeaderProps {
  onMobileMenuOpen: () => void;
  className?: string | undefined;
}

export function AdminHeader({ onMobileMenuOpen, className }: AdminHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm lg:px-6',
        className,
      )}
    >
      <button
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
}
