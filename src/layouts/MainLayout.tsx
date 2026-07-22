import { Outlet } from 'react-router-dom';
import { Container } from '@/components/ui/Container';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Container size="xl" className="py-8">
        <Outlet />
      </Container>
    </div>
  );
}
