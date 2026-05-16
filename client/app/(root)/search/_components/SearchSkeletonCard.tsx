import { Skeleton } from '@/components/ui/skeleton';

export function SearchSkeletonCard() {
  return (
    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-7 w-14 rounded" />
      </div>
      <div className="flex gap-4 mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-32 w-full rounded" />
    </div>
  );
}
