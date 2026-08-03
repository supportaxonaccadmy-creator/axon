import { memo, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { cn } from '@/utils/cn';

interface InstallButtonProps { className?: string; variant?: 'primary' | 'ghost'; }

function InstallButtonComponent({ className, variant = 'primary' }: InstallButtonProps) {
  const { canInstall, promptInstall } = useInstallPrompt();
  const handleInstall = useCallback(async () => { await promptInstall(); }, [promptInstall]);
  if (!canInstall) return null;
  return (
    <button onClick={handleInstall} className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors', variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'text-primary-600 hover:bg-primary-50', className)} aria-label="Install app">
      <Download className="h-4 w-4" /> Install App
    </button>
  );
}
export const InstallButton = memo(InstallButtonComponent);
