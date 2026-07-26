export type EnrollmentType = 'purchase' | 'admin' | 'free';
export type EnrollmentStatus = 'active' | 'expired' | 'cancelled';

export interface Enrollment {
  id: string;
  profileId: string;
  batchId: string;
  pricingId: string;
  enrollmentType: EnrollmentType;
  accessStatus: EnrollmentStatus;
  enrolledAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentInsert {
  profileId: string;
  batchId: string;
  pricingId: string;
  enrollmentType?: EnrollmentType | undefined;
  accessStatus?: EnrollmentStatus | undefined;
  enrolledAt?: string | undefined;
  expiresAt?: string | null | undefined;
}

export interface EnrollmentUpdate {
  profileId?: string | undefined;
  batchId?: string | undefined;
  pricingId?: string | undefined;
  enrollmentType?: EnrollmentType | undefined;
  accessStatus?: EnrollmentStatus | undefined;
  enrolledAt?: string | undefined;
  expiresAt?: string | null | undefined;
}

export interface EnrollmentRow {
  id: string;
  profile_id: string;
  batch_id: string;
  pricing_id: string;
  enrollment_type: EnrollmentType;
  access_status: EnrollmentStatus;
  enrolled_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentWithDetails extends Enrollment {
  batchTitle: string | null;
  batchSlug: string | null;
  profileName: string | null;
  profileEmail: string | null;
}
