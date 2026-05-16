import { GlobeIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

import { ArchiveSkeletonRow } from './_components/ArchiveSkeletonRow';

export default function ArchiveLoading() {
  return (
    <div className="container max-w-[1024px] mx-auto px-4">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-300 dark:border-zinc-700">
        <GlobeIcon size={20} className="text-zinc-400" />
        <Skeleton className="h-6 w-36" />
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {Array.from({ length: 10 }).map((_, i) => (
          <ArchiveSkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
