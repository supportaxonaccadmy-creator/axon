import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function NotFoundState({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has been moved.",
  className,
}: NotFoundStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <p className="text-6xl font-bold text-neutral-300">404</p>
      <h3 className="mt-4 text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <Link
        to={ROUTES.HOME}
        className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        Go Home
      </Link>
    </div>
  );
}
