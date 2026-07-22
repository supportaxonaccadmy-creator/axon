import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';

export function AccessDeniedPage() {
  return (
    <Container size="md" className="py-16">
      <ErrorState
        title="Access Denied"
        description="You do not have permission to access this resource."
      />
    </Container>
  );
}
