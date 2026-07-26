import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const PATH_LABELS: Record<string, string> = {
  student: 'Dashboard', batches: 'My Batches', continue: 'Continue Learning',
  'live-classes': 'Live Classes', 'pdf-notes': 'PDF Notes', 'mcq-practice': 'MCQ Practice',
  progress: 'Progress', announcements: 'Announcements', profile: 'Profile', settings: 'Settings',
};

export function StudentBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link to={ROUTES.HOME} className="flex items-center text-neutral-400 transition-colors hover:text-neutral-700" aria-label="Home"><Home className="h-3.5 w-3.5" /></Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const label = PATH_LABELS[seg] ?? seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            {isLast ? <span className="font-medium text-neutral-800">{label}</span> : <Link to={href} className="text-neutral-400 transition-colors hover:text-neutral-700">{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
