import { memo } from 'react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { CouponManager } from '@/components/finance';
function CouponManagementPageComponent() { return (<PageContainer><SectionHeader title="Coupon Management" description="Create, manage, and track discount coupons" /><CouponManager /></PageContainer>); }
export const CouponManagementPage = memo(CouponManagementPageComponent);
