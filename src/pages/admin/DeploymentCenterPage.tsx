import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { DeploymentStatusCard } from '@/components/devops';
import { deploymentService } from '@/services/devops';

function DeploymentCenterPageComponent() {
  const checklist = deploymentService.getDeploymentChecklist();
  const rollbackSteps = deploymentService.getRollbackSteps();
  return (<PageContainer><SectionHeader title="Deployment Center" description="Manage deployments, view checklist, and rollback procedures" /><div className="mb-6"><DeploymentStatusCard /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Deployment Checklist</h3><div className="space-y-2">{checklist.map((item) => (<div key={item.id} className="flex items-center gap-2 text-sm text-neutral-600"><span className="h-2 w-2 rounded-full bg-neutral-300" />{item.description}{item.required && <span className="text-xs text-error-500">*Required</span>}</div>))}</div></div><div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Rollback Procedure</h3><div className="space-y-1.5">{rollbackSteps.map((step, i) => <div key={i} className="text-sm text-neutral-600">{step}</div>)}</div></div></div></PageContainer>);
}
export const DeploymentCenterPage = memo(DeploymentCenterPageComponent);
