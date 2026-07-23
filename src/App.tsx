import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { RootProvider } from '@/providers/RootProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <RootProvider>
        <QueryProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </QueryProvider>
      </RootProvider>
    </ErrorBoundary>
  );
}
