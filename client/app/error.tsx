'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
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
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 gap-5">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <div>
        <p className="text-xl font-semibold text-zinc-200">Something went wrong</p>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm">
          An unexpected error occurred. Try refreshing the page or go back home.
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
          href="/"
          className="px-4 py-2 text-sm rounded-md border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
