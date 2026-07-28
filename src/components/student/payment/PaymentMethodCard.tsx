import { memo } from 'react';
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaymentMethodCardProps {
  method: string;
  label: string;
  selected: boolean;
  onSelect: (method: string) => void;
}

const iconMap: Record<string, typeof CreditCard> = {
  card: CreditCard, upi: Smartphone, netbanking: Building2, wallet: Wallet,
};

function PaymentMethodCardComponent({ method, label, selected, onSelect }: PaymentMethodCardProps) {
  const Icon = iconMap[method] ?? CreditCard;
  return (
    <button
      type="button"
      onClick={() => onSelect(method)}
      aria-pressed={selected}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        selected ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300',
      )}
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', selected ? 'bg-primary-100' : 'bg-neutral-100')}>
        <Icon className={cn('h-4 w-4', selected ? 'text-primary-600' : 'text-neutral-500')} />
      </div>
      <span className={cn('text-sm font-medium', selected ? 'text-primary-700' : 'text-neutral-700')}>{label}</span>
    </button>
  );
}

export const PaymentMethodCard = memo(PaymentMethodCardComponent);
