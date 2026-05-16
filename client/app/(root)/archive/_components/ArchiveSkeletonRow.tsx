import { Skeleton } from '@/components/ui/skeleton';

export function ArchiveSkeletonRow() {
  return (
    <div className="py-3 flex items-start gap-3 px-2">
      <Skeleton className="w-3.5 h-3.5 mt-1 shrink-0 rounded-sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
