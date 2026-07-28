import { memo } from 'react';
import { Link } from 'react-router-dom';
import { SettingsSidebar } from '@/components/admin/settings';
import { PageHeader } from '@/components/ui/PageHeader';
import { SETTINGS_NAV } from '@/constants/settings';
import {
  ShieldCheck, UserCog, Globe, Search, Mail, CreditCard, HardDrive, Bell, Lock, Server, DatabaseBackup, ScrollText, Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Settings: ShieldCheck, ShieldCheck, UserCog, Globe, Search, Mail, CreditCard, HardDrive, Bell, Lock, Server, DatabaseBackup, ScrollText, Activity,
};

export function SettingsDashboardPage() {
  const cards = SETTINGS_NAV.filter((item) => item.key !== 'overview');

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" description="Manage roles, configuration, security, and system administration" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1"><SettingsSidebar /></div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((item) => {
              const Icon = iconMap[item.icon] ?? ShieldCheck;
              return (
                <Link key={item.key} to={item.href} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-primary-300 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50"><Icon className="h-5 w-5 text-primary-600" /></div>
                  <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingsLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon | undefined;
  children: React.ReactNode;
  actions?: React.ReactNode | undefined;
}

function SettingsLayoutComponent({ title, description, icon: Icon, children, actions }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50"><Icon className="h-5 w-5 text-primary-600" /></div>}
          <div><h1 className="text-2xl font-bold text-neutral-900">{title}</h1><p className="text-sm text-neutral-500">{description}</p></div>
        </div>
        {actions}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1"><SettingsSidebar /></div>
        <div className="lg:col-span-3 space-y-6">{children}</div>
      </div>
    </div>
  );
}

export const SettingsLayout = memo(SettingsLayoutComponent);
