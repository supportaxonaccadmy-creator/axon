import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, PlayCircle, Radio, FileText, HelpCircle, TrendingUp, Megaphone, User, Settings, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SecureNavItem } from '@/hooks/useFilteredNavItems';

const ICON_MAP: Record<string, LucideIcon> = { LayoutDashboard, Layers, PlayCircle, Radio, FileText, HelpCircle, TrendingUp, Megaphone, User, Settings };

interface StudentSidebarItemProps { item: SecureNavItem; collapsed: boolean; }

export function StudentSidebarItem({ item, collapsed }: StudentSidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href || (item.href !== '/student' && location.pathname.startsWith(item.href));
  const Icon = item.icon ? (ICON_MAP[item.icon] ?? LayoutDashboard) : LayoutDashboard;
  return (
    <Link to={item.href} aria-current={isActive ? 'page' : undefined} title={collapsed ? item.label : undefined} className={cn('group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150', isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-neutral-300 hover:bg-white/10 hover:text-white', collapsed && 'justify-center px-2')}>
      <Icon className={cn('h-4.5 w-4.5 shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} strokeWidth={isActive ? 2.5 : 2} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
    </Link>
  );
}
