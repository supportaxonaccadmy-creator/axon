import { useState, useEffect, useCallback } from 'react';
import { environmentService } from '@/services/devops';
import type { EnvironmentInfo } from '@/services/devops';

export function useEnvironment() {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo>(environmentService.getEnvironmentInfo());
  const [validation, setValidation] = useState(environmentService.validateEnvironment());
  const refresh = useCallback(() => { setEnvInfo(environmentService.getEnvironmentInfo()); setValidation(environmentService.validateEnvironment()); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return { envInfo, validation, isProduction: environmentService.isProduction(), isStaging: environmentService.isStaging(), isDevelopment: environmentService.isDevelopment(), featureFlags: environmentService.getFeatureFlags(), refresh };
}
