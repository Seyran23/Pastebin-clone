'use client';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { CalendarDays, CircleUserRound, Clock, GlobeIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { getArchive } from '@/lib/api';
import type { ArchiveItem } from '@/lib/types';
import { bytesToKilobytes, formatRemainingTime } from '@/lib/utils';

import { ArchiveSkeletonRow } from './_components/ArchiveSkeletonRow';

dayjs.extend(advancedFormat);

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchPage = useCallback(async (nextCursor?: string) => {
    try {
      const res = await getArchive(nextCursor);
      setItems((prev) => nextCursor ? [...prev, ...res.data] : res.data);
      setHasNextPage(res.pagination.hasNextPage);
      setCursor(res.pagination.nextCursor ?? undefined);
    } catch {
      setIsError(true);
    }
  }, []);

  useEffect(() => {
    fetchPage().finally(() => setIsLoading(false));
  }, [fetchPage]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    await fetchPage(cursor);
    setIsLoadingMore(false);
  };

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-neutral-800 dark:text-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-700">
        <GlobeIcon size={20} className="text-zinc-400" />
        <h1 className="text-xl font-semibold">Public Archive</h1>
        <span className="text-zinc-500 text-sm">— most recently created public pastes</span>
      </div>

      {isLoading && (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {Array.from({ length: 10 }).map((_, i) => <ArchiveSkeletonRow key={i} />)}
        </div>
      )}

      {isError && (
        <p className="text-center text-red-400 mt-10">Failed to load archive. Please try again.</p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-center text-zinc-400 mt-10">No public pastes yet.</p>
      )}

      {items.length > 0 && (
        <div className="divide-y divide-zinc-700">
          {items.map((paste) => (
            <div key={paste.id} className="py-3 flex items-start gap-3 hover:bg-zinc-800/40 px-2 -mx-2 rounded transition-colors">
              <GlobeIcon size={14} className="text-zinc-500 mt-1 shrink-0" />

              <div className="flex-1 min-w-0">
                <Link
                  href={`/${paste.link}`}
                  className="text-sky-300 hover:text-sky-400 font-medium truncate block"
                >
                  {paste.name || 'Untitled'}
                </Link>

                <div className="flex flex-wrap gap-3 text-zinc-500 text-xs mt-0.5">
                  {paste.author && (
                    <span className="flex items-center gap-1">
                      <CircleUserRound size={12} />
                      {paste.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {dayjs(paste.createdAt).format('MMM Do, YYYY')}
                  </span>
                  {paste.expiresAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatRemainingTime(Number(paste.expiresAt) - Date.now())}
                    </span>
                  )}
                  <span>{bytesToKilobytes(paste.size)}</span>
                  {paste.syntax && (
                    <span className="text-sky-400 font-mono bg-zinc-800 px-1.5 rounded">
                      {paste.syntax}
                    </span>
                  )}
                  {paste.category && (
                    <span className="text-zinc-400">{paste.category}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-md hover:border-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
