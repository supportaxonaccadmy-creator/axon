import { useFilteredNavItems } from '@/hooks/useFilteredNavItems';
import { STUDENT_NAV_ITEMS } from '@/constants/studentNavigation';
import { StudentSidebarItem } from './StudentSidebarItem';
import { StudentSidebarLogo } from './StudentSidebarLogo';
import { StudentSidebarFooter } from './StudentSidebarFooter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StudentSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string | undefined;
}

export function StudentSidebar({ collapsed, onToggleCollapse, className }: StudentSidebarProps) {
  const visibleItems = useFilteredNavItems(STUDENT_NAV_ITEMS);
  return (
    <aside className={cn('relative flex flex-col bg-neutral-900 transition-all duration-300', collapsed ? 'w-16' : 'w-64', className)}>
      <StudentSidebarLogo collapsed={collapsed} />
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" aria-label="Student navigation">
        {visibleItems.map((item) => (<StudentSidebarItem key={item.href} item={item} collapsed={collapsed} />))}
      </nav>
      <StudentSidebarFooter collapsed={collapsed} />
      <button onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400 shadow-md transition-colors hover:bg-neutral-700 hover:text-white">
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
