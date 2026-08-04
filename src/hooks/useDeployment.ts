import { useState, useCallback } from 'react';
import { deploymentService } from '@/services/devops';
import type { DeploymentRecord } from '@/services/devops';

export function useDeployment() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>(deploymentService.getDeployments());
  const createDeployment = useCallback((version: string, environment: 'development' | 'staging' | 'production', commitHash: string, deployedBy: string) => { const record = deploymentService.createDeployment(version, environment, commitHash, deployedBy); setDeployments(deploymentService.getDeployments()); return record; }, []);
  const updateStatus = useCallback((id: string, status: DeploymentRecord['status'], message: string) => { deploymentService.updateDeploymentStatus(id, status, message); setDeployments(deploymentService.getDeployments()); }, []);
  const checklist = deploymentService.getDeploymentChecklist();
  const rollbackSteps = deploymentService.getRollbackSteps();
  const latest = deploymentService.getLatestDeployment();
  return { deployments, latest, checklist, rollbackSteps, createDeployment, updateStatus };
}
