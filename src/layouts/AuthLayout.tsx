import { Outlet } from 'react-router-dom';
import { Container } from '@/components/ui/Container';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <Container size="sm" className="py-8">
        <Outlet />
      </Container>
    </div>
  );
}
