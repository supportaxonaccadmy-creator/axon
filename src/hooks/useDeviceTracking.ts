import { useState, useEffect, useCallback } from 'react';
import { deviceService } from '@/services/security';
import type { DeviceSession } from '@/services/security';
import { useCurrentUser } from '@/hooks/useProfile';

export function useDeviceTracking() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();
  const loadDevices = useCallback(async () => { if (!user?.id) { setLoading(false); return; } const sessions = await deviceService.getActiveSessions(user.id); setDevices(sessions); setLoading(false); }, [user?.id]);
  useEffect(() => { if (user?.id) { void deviceService.registerDevice(user.id); void loadDevices(); } }, [user?.id, loadDevices]);
  const revokeDevice = useCallback(async (deviceId: string) => { const success = await deviceService.revokeSession(deviceId); if (success) void loadDevices(); return success; }, [loadDevices]);
  const revokeAllDevices = useCallback(async () => { if (!user?.id) return false; const currentDevice = deviceService.getDeviceInfo().deviceId; const success = await deviceService.revokeAllSessions(user.id, currentDevice); if (success) void loadDevices(); return success; }, [user?.id, loadDevices]);
  return { devices, loading, revokeDevice, revokeAllDevices, reload: loadDevices };
}
