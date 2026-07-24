import type { FeatureFlag, FeatureFlagConfig } from '@/types/authorization';
import { FEATURE_FLAGS } from '@/constants/features';
import type { Role } from '@/types/authorization';

const flags: FeatureFlagConfig = { ...FEATURE_FLAGS };

export function isFeatureEnabled(key: string): boolean {
  const flag = flags[key];
  if (!flag) return false;
  return flag.enabled;
}

export function getFeatureFlag(key: string): FeatureFlag | null {
  return flags[key] ?? null;
}

export function getAllFeatureFlags(): FeatureFlag[] {
  return Object.values(flags);
}

export function canAccessFeature(key: string, role: Role | null): boolean {
  const flag = flags[key];
  if (!flag || !flag.enabled) return false;
  if (flag.roles && role) {
    return flag.roles.includes(role);
  }
  if (flag.roles && !role) return false;
  return true;
}

export function setFeatureEnabled(key: string, enabled: boolean): void {
  if (flags[key]) {
    flags[key] = { ...flags[key], enabled };
  }
}

export function getEnabledFeatures(): string[] {
  return Object.values(flags)
    .filter((f) => f.enabled)
    .map((f) => f.key);
}
