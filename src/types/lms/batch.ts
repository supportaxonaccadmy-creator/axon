export type LmsStatus = 'draft' | 'published' | 'archived';

export interface Batch {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  banner: string | null;
  icon: string | null;
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  isPublished: boolean;
  sortOrder: number;
  status: LmsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BatchInsert {
  title: string;
  slug: string;
  description?: string | null | undefined;
  thumbnail?: string | null | undefined;
  banner?: string | null | undefined;
  icon?: string | null | undefined;
  price?: number | undefined;
  discountPrice?: number | null | undefined;
  isFree?: boolean | undefined;
  isPublished?: boolean | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface BatchUpdate {
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  thumbnail?: string | null | undefined;
  banner?: string | null | undefined;
  icon?: string | null | undefined;
  price?: number | undefined;
  discountPrice?: number | null | undefined;
  isFree?: boolean | undefined;
  isPublished?: boolean | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface BatchWithCounts extends Batch {
  subjectCount: number;
}

export interface BatchRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  banner: string | null;
  icon: string | null;
  price: number;
  discount_price: number | null;
  is_free: boolean;
  is_published: boolean;
  sort_order: number;
  status: LmsStatus;
  created_at: string;
  updated_at: string;
}
