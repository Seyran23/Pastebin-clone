import { Skeleton } from '@/components/ui/skeleton';

import { SearchSkeletonCard } from './_components/SearchSkeletonCard';

export default function SearchLoading() {
  return (
    <div className="container max-w-[1024px] mx-auto px-4">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SearchSkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
