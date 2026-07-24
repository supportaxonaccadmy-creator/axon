import { useFilteredNavItems, type SecureNavItem } from '@/hooks/useFilteredNavItems';
import { cn } from '@/utils/cn';

export interface NavListProps {
  items: SecureNavItem[];
  className?: string | undefined;
  onNavigate?: (() => void) | undefined;
}

export function NavList({ items, className, onNavigate }: NavListProps) {
  const filteredItems = useFilteredNavItems(items);

  if (filteredItems.length === 0) {
    return <p className="px-3 py-2 text-sm text-neutral-400">No navigation available.</p>;
  }

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {filteredItems.map((item) => (
        <div key={item.href}>
          <a
            href={item.href}
            onClick={onNavigate}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            {item.label}
          </a>
          {item.children && item.children.length > 0 && (
            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-neutral-200 pl-3">
              {item.children.map((child) => (
                <a
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className="block rounded-lg px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {child.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
