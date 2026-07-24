import { Skeleton, SkeletonText } from '@/components/feedback/Skeleton';
import { Card, CardContent } from '@/components/ui/Card';

export function ProfileSkeleton() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="flex items-center gap-6 mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <SkeletonText lines={4} />
      </CardContent>
    </Card>
  );
}
