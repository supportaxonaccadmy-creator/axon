import { useFilteredNavItems } from '@/hooks/useFilteredNavItems';
import { ADMIN_NAV_ITEMS } from '@/constants/adminNavigation';
import { SidebarItem } from './SidebarItem';
import { SidebarLogo } from './SidebarLogo';
import { SidebarFooter } from './SidebarFooter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string | undefined;
}

export function AdminSidebar({ collapsed, onToggleCollapse, className }: AdminSidebarProps) {
  const visibleItems = useFilteredNavItems(ADMIN_NAV_ITEMS);

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-neutral-900 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
    >
      <SidebarLogo collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" aria-label="Admin navigation">
        {visibleItems.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <SidebarFooter collapsed={collapsed} />

      <button
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400 shadow-md transition-colors hover:bg-neutral-700 hover:text-white"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
