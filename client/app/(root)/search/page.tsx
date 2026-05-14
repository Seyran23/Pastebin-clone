"use client";

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useSearchPastes } from '@/hooks/useSearch';
import { SearchPastesQuery } from '@/lib/types';

import PasteSearchCard from './_components/PasteSearchCard';
import SearchFilters from './_components/SearchFilters';

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();

  const urlQ = params.get('q') || '';
  const urlCategory = params.get('category') || 'all';
  const urlTime = params.get('time') || 'all';
  const urlSort = params.get('sort') || 'newest';

  const [q, setQ] = useState(urlQ);
  const [category, setCategory] = useState(urlCategory);
  const [time, setTime] = useState(urlTime);
  const [sort, setSort] = useState(urlSort);
  const [searchQuery, setSearchQuery] = useState<SearchPastesQuery | null>(null);

  useEffect(() => {
    setQ(urlQ);
    setCategory(urlCategory);
    setTime(urlTime);
    setSort(urlSort);
    setSearchQuery(null);
  }, [urlQ, urlCategory, urlTime, urlSort]);

  const { data, isLoading, isError } = useSearchPastes(searchQuery!, !!searchQuery);

  const doSearch = () => {
    const parts = new URLSearchParams();
    if (q) parts.set('q', q);
    if (category !== 'all') parts.set('category', category);
    if (time !== 'all') parts.set('time', time);
    if (sort !== 'newest') parts.set('sort', sort);
    router.push(`/search?${parts.toString()}`);

    setSearchQuery({
      searchTerm: q,
      category: category !== 'all' ? category : undefined,
      time: time !== 'all' ? (time as SearchPastesQuery['time']) : undefined,
      sort: sort as SearchPastesQuery['sort'],
      limit: 10,
      direction: 'next',
      cursor: undefined,
    });
  };

  return (
    <div className="container max-w-[1024px] mx-auto px-4 text-white">
      <SearchFilters
        q={q}
        category={category}
        time={time}
        sort={sort}
        onQChange={setQ}
        onCategoryChange={setCategory}
        onTimeChange={setTime}
        onSortChange={setSort}
        onSearch={doSearch}
      />

      {isLoading && (
        <div className="flex justify-center mt-10">
          <Loader2 className="animate-spin w-8 h-8 text-neutral-400" />
        </div>
      )}
      {isError && (
        <p className="text-center text-red-400 mt-6">Failed to fetch pastes.</p>
      )}
      {data && data.data.length === 0 && (
        <p className="text-center text-neutral-400 mt-6">No results found.</p>
      )}

      <div className="mt-8 space-y-4">
        {data?.data.map((paste) => (
          <PasteSearchCard key={paste.id} paste={paste} />
        ))}
      </div>

      {data?.pagination && (
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            disabled={!data.pagination.hasPrevPage}
            onClick={() =>
              setSearchQuery((q) => q ? { ...q, direction: 'prev', cursor: data.pagination.prevCursor ?? undefined } : q)
            }
          >
            ← Previous
          </Button>
          <span className="text-sm text-neutral-400">
            {data.pagination.itemsPerPage} per page
          </span>
          <Button
            variant="outline"
            disabled={!data.pagination.hasNextPage}
            onClick={() =>
              setSearchQuery((q) => q ? { ...q, direction: 'next', cursor: data.pagination.nextCursor ?? undefined } : q)
            }
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
