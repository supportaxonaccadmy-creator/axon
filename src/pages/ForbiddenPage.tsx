import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export function ForbiddenPage() {
  return (
    <Container size="md" className="flex min-h-screen items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
          <svg className="h-8 w-8 text-error-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">403 — Forbidden</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
          You don&apos;t have permission to access this resource. If you believe this is an error,
          please contact your administrator.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href={ROUTES.HOME}>
            <Button variant="primary" size="sm">
              Go Home
            </Button>
          </a>
          <a href={ROUTES.PROFILE}>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
}
