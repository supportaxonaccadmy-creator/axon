import { memo, useState, useCallback } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { socialMetaService } from '@/services/seo';
import type { SocialShareConfig } from '@/services/seo';

interface SocialShareCardProps { config: SocialShareConfig; className?: string; }

function SocialShareCardComponent({ config, className }: SocialShareCardProps) {
  const [copied, setCopied] = useState(false);
  const handleShare = useCallback((platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram') => { socialMetaService.share(platform, config); }, [config]);
  const handleCopy = useCallback(async () => { const success = await socialMetaService.copyLink(config.url); if (success) { setCopied(true); setTimeout(() => setCopied(false), 2000); } }, [config.url]);
  const platforms: { platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram'; icon: typeof Share2; label: string; color: string }[] = [
    { platform: 'facebook', icon: Share2, label: 'Facebook', color: 'hover:bg-blue-50 hover:text-blue-600' },
    { platform: 'twitter', icon: Share2, label: 'Twitter', color: 'hover:bg-sky-50 hover:text-sky-500' },
    { platform: 'linkedin', icon: Share2, label: 'LinkedIn', color: 'hover:bg-blue-50 hover:text-blue-700' },
    { platform: 'whatsapp', icon: Share2, label: 'WhatsApp', color: 'hover:bg-green-50 hover:text-green-600' },
    { platform: 'telegram', icon: Share2, label: 'Telegram', color: 'hover:bg-blue-50 hover:text-blue-500' },
  ];
  return (<div className={`flex items-center gap-2 ${className ?? ''}`}><span className="text-sm font-medium text-neutral-500">Share:</span>{platforms.map(({ platform, icon: Icon, label, color }) => (<button key={platform} onClick={() => handleShare(platform)} className={`flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors ${color}`} aria-label={`Share on ${label}`}><Icon className="h-4 w-4" /></button>))}<button onClick={handleCopy} className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-100" aria-label="Copy link">{copied ? <Check className="h-4 w-4 text-success-500" /> : <Link2 className="h-4 w-4" />}</button></div>);
}
export const SocialShareCard = memo(SocialShareCardComponent);
