import { memo } from 'react';
import { BookOpen, Clock, Users, Star } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData } from '@/hooks/useStructuredData';
import { seoService } from '@/services/seo';

interface CourseSEOCardProps { courseName: string; courseType: string; description: string; duration?: string; studentCount?: number; rating?: number; provider?: string; url?: string; }

function CourseSEOCardComponent({ courseName, courseType, description, duration, studentCount, rating, provider = 'Enterprise Nursing LMS', url }: CourseSEOCardProps) {
  const meta = seoService.generateCourseMeta(courseName, courseType, description);
  useSEO(meta);
  const { injectCourse } = useStructuredData();
  injectCourse(courseName, description, provider, url);
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50"><BookOpen className="h-4 w-4 text-primary-600" /></div><h3 className="text-sm font-semibold text-neutral-900">{courseName}</h3></div><p className="mb-4 text-sm text-neutral-600">{description.slice(0, 120)}{description.length > 120 ? '...' : ''}</p><div className="flex flex-wrap gap-4 text-xs text-neutral-500">{duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {duration}</span>}{studentCount !== undefined && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {studentCount} students</span>}{rating !== undefined && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning-500" /> {rating}/5</span>}</div></div>);
}
export const CourseSEOCard = memo(CourseSEOCardComponent);
