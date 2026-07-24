import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Award, Video,
  MessageSquare, BarChart3, HardDrive, Settings, LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { SecureNavItem } from '@/hooks/useFilteredNavItems';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, BookOpen, ClipboardList, Award, Video,
  MessageSquare, BarChart3, HardDrive, Settings,
};

const ACTIVE_FEATURES = new Set(['courses', 'analytics', 'userManagement']);

interface SidebarItemProps {
  item: SecureNavItem;
  collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
  const Icon = item.icon ? (ICON_MAP[item.icon] ?? LayoutDashboard) : LayoutDashboard;
  const isComingSoon = item.feature ? !ACTIVE_FEATURES.has(item.feature) : false;

  return (
    <Link
      to={item.href}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-neutral-300 hover:bg-white/10 hover:text-white',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className={cn('h-4.5 w-4.5 shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} strokeWidth={isActive ? 2.5 : 2} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {isComingSoon && (
            <Badge variant="default" className="ml-auto shrink-0 bg-white/10 text-neutral-400 text-[10px] px-1.5 py-0">
              Soon
            </Badge>
          )}
        </>
      )}
      {collapsed && isComingSoon && (
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-neutral-500" />
      )}
    </Link>
  );
}
