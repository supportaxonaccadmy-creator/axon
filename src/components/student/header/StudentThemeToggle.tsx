import { Sun, Moon, Monitor, LucideIcon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/utils/cn';

type ThemeOption = 'light' | 'dark' | 'system';
const OPTIONS: { value: ThemeOption; icon: LucideIcon; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' }, { value: 'dark', icon: Moon, label: 'Dark' }, { value: 'system', icon: Monitor, label: 'System' },
];

export function StudentThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex h-9 items-center rounded-lg border border-neutral-200 bg-white p-0.5" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button key={value} onClick={() => setTheme(value)} title={label} aria-pressed={theme === value} className={cn('flex h-7 w-7 items-center justify-center rounded-md transition-all', theme === value ? 'bg-primary-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-700')}><Icon className="h-3.5 w-3.5" /></button>
      ))}
    </div>
  );
}
