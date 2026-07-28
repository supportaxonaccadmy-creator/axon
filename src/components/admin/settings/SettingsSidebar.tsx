import { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings, ShieldCheck, UserCog, Globe, Search, Mail, CreditCard,
  HardDrive, Bell, Lock, Server, DatabaseBackup, ScrollText, Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SETTINGS_NAV } from '@/constants/settings';

const iconMap: Record<string, LucideIcon> = {
  Settings, ShieldCheck, UserCog, Globe, Search, Mail, CreditCard,
  HardDrive, Bell, Lock, Server, DatabaseBackup, ScrollText, Activity,
};

function SettingsSidebarComponent() {
  const location = useLocation();
  const items = useMemo(() => SETTINGS_NAV, []);

  return (
    <nav className="space-y-1" aria-label="Settings navigation">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = location.pathname === item.href || (item.href !== '/admin/settings' && location.pathname.startsWith(item.href));
        return (
          <Link
            key={item.key}
            to={item.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const SettingsSidebar = memo(SettingsSidebarComponent);
