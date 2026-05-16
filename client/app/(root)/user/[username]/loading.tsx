import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfileLoading() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
