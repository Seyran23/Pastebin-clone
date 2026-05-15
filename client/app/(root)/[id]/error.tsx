'use client';

import { FileX } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PasteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container max-w-[1024px] mx-auto px-4 py-16 flex flex-col items-center text-center gap-5">
      <FileX className="w-10 h-10 text-zinc-500" />
      <div>
        <p className="text-lg font-semibold text-zinc-300">Failed to load paste</p>
        <p className="text-sm text-zinc-500 mt-1">
          This paste may have expired, been deleted, or there was a network error.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm rounded-md bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/archive"
          className="px-4 py-2 text-sm rounded-md border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Browse pastes
        </Link>
      </div>
    </div>
  );
}
