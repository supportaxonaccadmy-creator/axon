import { useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id ?? '');

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-neutral-200">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active === item.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {items.map((item) => (
          <div key={item.id} hidden={active !== item.id}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
