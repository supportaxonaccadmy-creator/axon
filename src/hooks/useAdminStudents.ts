import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { purchaseService } from '@/services/lms/purchaseService';
import { batchService } from '@/services/lms/batchService';
import type { Enrollment, Purchase, Batch, EnrollmentStatus, PaymentStatus } from '@/types/lms';

export interface AdminStudent {
  id: string;
  authUserId: string;
  uuid: string;
  fullName: string | null;
  email: string | null;
  mobile: string | null;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enrollmentCount: number;
  purchaseCount: number;
  totalSpent: number;
}

export interface StudentEnrollmentWithBatch extends Enrollment {
  batchTitle: string;
  batchSlug: string;
}

export interface StudentPurchaseWithBatch extends Purchase {
  batchTitle: string;
}

export interface StudentAnalytics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  paidStudents: number;
  freeStudents: number;
  totalRevenue: number;
  totalEnrollments: number;
  completionRate: number;
}

interface UseAdminStudentsParams {
  search?: string | undefined;
  status?: string | undefined;
  batchId?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

interface ProfileRow {
  id: string;
  auth_user_id: string;
  uuid: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAdminStudents(params: UseAdminStudentsParams = {}) {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(params.page ?? 1);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: batchData } = await batchService.list();
      setBatches(batchData ?? []);

      let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
      if (params.search) {
        countQuery = countQuery.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,mobile.ilike.%${params.search}%`);
      }
      if (params.status === 'active') countQuery = countQuery.eq('is_active', true);
      if (params.status === 'inactive') countQuery = countQuery.eq('is_active', false);
      const { count } = await countQuery;
      const totalCount = count ?? 0;

      let query = supabase.from('profiles').select('*').eq('role', 'student');
      if (params.search) {
        query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,mobile.ilike.%${params.search}%`);
      }
      if (params.status === 'active') query = query.eq('is_active', true);
      if (params.status === 'inactive') query = query.eq('is_active', false);
      query = query.order('created_at', { ascending: false });
      const offset = (page - 1) * pageSize;
      query = query.range(offset, offset + pageSize - 1);
      const { data, error: queryError } = await query;

      if (queryError) throw new Error(queryError.message);

      const profileRows = (data as ProfileRow[]) ?? [];
      const profileIds = profileRows.map((p) => p.id);

      const [enrollmentsResult, purchasesResult] = await Promise.all([
        Promise.all(profileIds.map((pid) => enrollmentService.list({ profileId: pid }))),
        Promise.all(profileIds.map((pid) => purchaseService.list({ profileId: pid }))),
      ]);

      let enriched: AdminStudent[] = profileRows.map((row, i) => {
        const enrollments = enrollmentsResult[i]?.data ?? [];
        const purchases = purchasesResult[i]?.data ?? [];
        const totalSpent = purchases.filter((p) => p.paymentStatus === 'completed').reduce((sum, p) => sum + p.amount, 0);
        return {
          id: row.id, authUserId: row.auth_user_id, uuid: row.uuid, fullName: row.full_name, email: row.email,
          mobile: row.mobile, avatarUrl: row.avatar_url, role: row.role, isActive: row.is_active,
          createdAt: row.created_at, updatedAt: row.updated_at,
          enrollmentCount: enrollments.length, purchaseCount: purchases.length, totalSpent,
        };
      });

      if (params.status === 'purchased') enriched = enriched.filter((s) => s.purchaseCount > 0);
      if (params.status === 'free') enriched = enriched.filter((s) => s.purchaseCount === 0);
      if (params.batchId) {
        const batchEnrollmentIds = new Set<string>();
        for (const er of enrollmentsResult) {
          for (const e of er.data ?? []) {
            if (e.batchId === params.batchId) batchEnrollmentIds.add(e.profileId);
          }
        }
        enriched = enriched.filter((s) => batchEnrollmentIds.has(s.id));
      }

      setStudents(enriched);
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize) || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status, params.batchId, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { students, batches, loading, error, total, totalPages, page, pageSize, setPage, setPageSize, refresh: load };
}

export function useStudentDetails(studentId: string | undefined) {
  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollmentWithBatch[]>([]);
  const [purchases, setPurchases] = useState<StudentPurchaseWithBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) { setLoading(false); setError('No student specified'); return; }
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', studentId).maybeSingle();
      if (profileError || !profile) { setError(profileError?.message ?? 'Student not found'); setLoading(false); return; }
      const row = profile as ProfileRow;

      const [enrollRes, purchRes, batchRes] = await Promise.all([
        enrollmentService.list({ profileId: studentId }),
        purchaseService.list({ profileId: studentId }),
        batchService.list(),
      ]);
      const batchMap = new Map((batchRes.data ?? []).map((b) => [b.id, b]));
      const enrollmentsWithBatch: StudentEnrollmentWithBatch[] = (enrollRes.data ?? []).map((e) => {
        const b = batchMap.get(e.batchId);
        return { ...e, batchTitle: b?.title ?? 'Unknown', batchSlug: b?.slug ?? 'unknown' };
      });
      const purchasesWithBatch: StudentPurchaseWithBatch[] = (purchRes.data ?? []).map((p) => {
        const b = batchMap.get(p.batchId);
        return { ...p, batchTitle: b?.title ?? 'Unknown' };
      });
      const totalSpent = (purchRes.data ?? []).filter((p) => p.paymentStatus === 'completed').reduce((sum, p) => sum + p.amount, 0);
      setStudent({
        id: row.id, authUserId: row.auth_user_id, uuid: row.uuid, fullName: row.full_name, email: row.email,
        mobile: row.mobile, avatarUrl: row.avatar_url, role: row.role, isActive: row.is_active,
        createdAt: row.created_at, updatedAt: row.updated_at,
        enrollmentCount: enrollmentsWithBatch.length, purchaseCount: purchasesWithBatch.length, totalSpent,
      });
      setEnrollments(enrollmentsWithBatch);
      setPurchases(purchasesWithBatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  return { student, enrollments, purchases, loading, error, refresh: load };
}

export function useAdminEnrollments(params: { status?: string | undefined; batchId?: string | undefined; profileId?: string | undefined; page?: number | undefined; pageSize?: number | undefined } = {}) {
  const [enrollments, setEnrollments] = useState<(Enrollment & { studentName: string; studentEmail: string; batchTitle: string })[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(params.page ?? 1);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: batchData } = await batchService.list();
      setBatches(batchData ?? []);
      const batchMap = new Map((batchData ?? []).map((b) => [b.id, b]));

      const opts: Record<string, unknown> = {};
      if (params.batchId) opts.batchId = params.batchId;
      if (params.profileId) opts.profileId = params.profileId;
      if (params.status && params.status !== 'all') opts.accessStatus = params.status as EnrollmentStatus;
      opts.sort = { column: 'enrolled_at', direction: 'desc' as const };

      const result = await enrollmentService.paginate(page, pageSize, opts as never);

      const profileIds = [...new Set(result.data.map((e) => e.profileId))];
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', profileIds);
      const profileMap = new Map((profiles as ProfileRow[] | null ?? []).map((p) => [p.id, p]));

      const enriched = result.data.map((e) => {
        const p = profileMap.get(e.profileId);
        const b = batchMap.get(e.batchId);
        return { ...e, studentName: p?.full_name ?? 'Unknown', studentEmail: p?.email ?? 'Unknown', batchTitle: b?.title ?? 'Unknown' };
      });

      setEnrollments(enriched);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [params.status, params.batchId, params.profileId, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { enrollments, batches, loading, error, total, totalPages, page, pageSize, setPage, setPageSize, refresh: load };
}

export function useAdminPurchases(params: { status?: string | undefined; batchId?: string | undefined; profileId?: string | undefined; page?: number | undefined; pageSize?: number | undefined } = {}) {
  const [purchases, setPurchases] = useState<(Purchase & { studentName: string; studentEmail: string; batchTitle: string })[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(params.page ?? 1);
  const [pageSize, setPageSize] = useState(params.pageSize ?? 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: batchData } = await batchService.list();
      setBatches(batchData ?? []);
      const batchMap = new Map((batchData ?? []).map((b) => [b.id, b]));

      const opts: Record<string, unknown> = {};
      if (params.batchId) opts.batchId = params.batchId;
      if (params.profileId) opts.profileId = params.profileId;
      if (params.status && params.status !== 'all') opts.paymentStatus = params.status as PaymentStatus;
      opts.sort = { column: 'purchased_at', direction: 'desc' as const };

      const result = await purchaseService.paginate(page, pageSize, opts as never);

      const profileIds = [...new Set(result.data.map((p) => p.profileId))];
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', profileIds);
      const profileMap = new Map((profiles as ProfileRow[] | null ?? []).map((p) => [p.id, p]));

      const enriched = result.data.map((p) => {
        const prof = profileMap.get(p.profileId);
        const b = batchMap.get(p.batchId);
        return { ...p, studentName: prof?.full_name ?? 'Unknown', studentEmail: prof?.email ?? 'Unknown', batchTitle: b?.title ?? 'Unknown' };
      });

      setPurchases(enriched);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [params.status, params.batchId, params.profileId, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  return { purchases, batches, loading, error, total, totalPages, page, pageSize, setPage, setPageSize, refresh: load };
}

export function useStudentAnalytics() {
  const [analytics, setAnalytics] = useState<StudentAnalytics>({ totalStudents: 0, activeStudents: 0, inactiveStudents: 0, paidStudents: 0, freeStudents: 0, totalRevenue: 0, totalEnrollments: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { count: totalStudents } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: activeStudents } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true);
      const { count: totalEnrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });

      const { data: purchases } = await purchaseService.list({ paymentStatus: 'completed' });
      const totalRevenue = (purchases ?? []).reduce((sum, p) => sum + p.amount, 0);
      const paidStudentIds = new Set((purchases ?? []).map((p) => p.profileId));

      setAnalytics({
        totalStudents: totalStudents ?? 0,
        activeStudents: activeStudents ?? 0,
        inactiveStudents: (totalStudents ?? 0) - (activeStudents ?? 0),
        paidStudents: paidStudentIds.size,
        freeStudents: (totalStudents ?? 0) - paidStudentIds.size,
        totalRevenue,
        totalEnrollments: totalEnrollments ?? 0,
        completionRate: 0,
      });
    } catch {
      setAnalytics({ totalStudents: 0, activeStudents: 0, inactiveStudents: 0, paidStudents: 0, freeStudents: 0, totalRevenue: 0, totalEnrollments: 0, completionRate: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return useMemo(() => ({ analytics, loading }), [analytics, loading]);
}

export type { EnrollmentStatus, PaymentStatus };
