import { memo, useState } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { PlayCircle, ExternalLink, Lock, Copy } from 'lucide-react';
import type { LiveClass } from '@/services/live';
import { isLiveNow, isUpcoming } from '@/services/live';

interface JoinMeetingButtonProps {
  liveClass: LiveClass;
  onJoin?: (liveClass: LiveClass) => void;
  className?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
}

function JoinMeetingButtonComponent({ liveClass, onJoin, className, size = 'md' }: JoinMeetingButtonProps) {
  const [copied, setCopied] = useState(false);

  const live = isLiveNow(liveClass);
  const upcoming = isUpcoming(liveClass);
  const canJoin = (live || upcoming) && !!liveClass.meetingUrl;

  const handleJoin = () => {
    if (onJoin) {
      onJoin(liveClass);
    } else if (liveClass.meetingUrl) {
      window.open(liveClass.meetingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyPassword = async () => {
    if (!liveClass.meetingPassword) return;
    try {
      await navigator.clipboard.writeText(liveClass.meetingPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        size={size}
        variant={live ? 'danger' : 'primary'}
        onClick={handleJoin}
        disabled={!canJoin}
      >
        <PlayCircle className="h-4 w-4" />
        {live ? 'Join Live' : upcoming ? 'Join Meeting' : 'View Details'}
      </Button>
      {liveClass.meetingPassword && canJoin && (
        <button
          type="button"
          onClick={handleCopyPassword}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
          title="Copy meeting password"
        >
          {copied ? <Copy className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Password'}
        </button>
      )}
      {liveClass.meetingUrl && (
        <a
          href={liveClass.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-neutral-600"
          aria-label="Open meeting in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export const JoinMeetingButton = memo(JoinMeetingButtonComponent);