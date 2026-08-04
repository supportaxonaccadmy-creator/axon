import { memo, useEffect } from 'react';
import { utmService } from '@/services/seo';

function UTMTrackerComponent() { useEffect(() => { utmService.captureAndStore(); }, []); return null; }
export const UTMTracker = memo(UTMTrackerComponent);
