import { Outlet } from 'react-router-dom';
import { Container } from '@/components/ui/Container';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 px-4 py-8">
      <Container size="sm" className="py-8">
        <Outlet />
      </Container>
    </div>
  );
}
