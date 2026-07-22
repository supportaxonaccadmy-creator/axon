import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { APP_CONFIG } from '@/constants/app';

export function HomePage() {
  return (
    <Container size="xl" className="py-8">
      <PageHeader title={APP_CONFIG.name} description={APP_CONFIG.description} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card hover>
          <CardContent>
            <Badge variant="primary">Foundation</Badge>
            <h3 className="mt-3 text-lg font-semibold text-neutral-900">Application Architecture</h3>
            <p className="mt-1 text-sm text-neutral-500">
              React Router, layout system, global providers, error boundary, and reusable UI components.
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent>
            <Badge variant="success">Ready</Badge>
            <h3 className="mt-3 text-lg font-semibold text-neutral-900">Production Ready</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Strict TypeScript, Tailwind CSS, path aliases, and clean modular architecture.
            </p>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent>
            <Badge variant="warning">Phase 1A.2</Badge>
            <h3 className="mt-3 text-lg font-semibold text-neutral-900">Scalable Foundation</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Built for future LMS modules, authentication, and database integration.
            </p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
