import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`w-full max-w-md mx-auto shadow-lg ${className ?? ''}`}>
      <CardContent className="p-8">{children}</CardContent>
    </Card>
  );
}
