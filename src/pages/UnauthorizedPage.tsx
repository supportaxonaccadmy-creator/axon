import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';

export function UnauthorizedPage() {
  return (
    <Container size="md" className="py-16">
      <ErrorState
        title="Unauthorized"
        description="You are not authorized to view this page. Please contact an administrator if you believe this is an error."
      />
    </Container>
  );
}
