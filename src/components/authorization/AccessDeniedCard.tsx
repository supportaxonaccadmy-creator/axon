import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

export interface AccessDeniedCardProps {
  title?: string | undefined;
  message?: string | undefined;
}

export function AccessDeniedCard({
  title = 'Access Denied',
  message = 'You do not have the required permissions to access this page.',
}: AccessDeniedCardProps) {
  return (
    <Container size="md" className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
          <svg className="h-8 w-8 text-error-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              Go Home
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
}
