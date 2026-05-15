"use client";
import { useQuery } from "@tanstack/react-query";
import { GlobeIcon, LinkIcon, Lock } from "lucide-react";
import Link from "next/link";

import { getPublicPastes } from '@/lib/api';
import { IRecentPublicPaste } from '@/lib/types';
import { bytesToKilobytes, timeAgo } from "@/lib/utils";

function SkeletonItem() {
  return (
    <div className="flex items-start gap-1.5 p-1.5 border-b border-dashed border-neutral-700/50 last:border-b-0">
      <div className="w-3.5 h-3.5 mt-0.5 rounded bg-neutral-700 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-neutral-700 animate-pulse rounded w-3/4" />
        <div className="h-2.5 bg-neutral-700/60 animate-pulse rounded w-1/2" />
      </div>
    </div>
  );
}

const LastestPastes = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicPastes"],
    queryFn: getPublicPastes,
  });

  if (isError) return <p className="text-sm text-red-400 p-3">Failed to load pastes.</p>;

  return (
    <div className="bg-neutral-800 p-3">
      <Link href={"/archive"}>
        <h3 className="text-neutral-400 text-sm font-medium mb-3 pb-1.5 border-b border-dashed border-neutral-700 transition-colors hover:text-sky-400">
          Recent Public Pastes
        </h3>
      </Link>

      <div className="space-y-1">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)
        ) : data && data.length > 0 ? (
          data.map((paste: IRecentPublicPaste) => (
            <div
              key={paste.id}
              className="flex items-center gap-1.5 p-1.5 border-b border-dashed border-neutral-700/50 last:border-b-0 transition-colors hover:bg-neutral-700/10 text-xs"
            >
              <div className="flex-shrink-0">
                {paste.exposure === "public" && (
                  <GlobeIcon className="w-3.5 h-3.5 text-neutral-400" />
                )}
                {paste.exposure === "unlisted" && (
                  <LinkIcon className="w-3.5 h-3.5 rotate-[-90deg] text-neutral-400" />
                )}
                {paste.exposure === "private" && (
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-normal text-sky-300 truncate transition-colors hover:text-sky-400">
                  <Link href={`/${paste.linkEndpoint}`} className="flex items-center gap-1">
                    {paste.title}
                  </Link>
                </div>
                <div className="text-[0.7rem] text-neutral-500 flex gap-1 tracking-tight">
                  <span>{paste.syntaxHighlight?.name}</span>
                  <span className="text-neutral-600">|</span>
                  <span>{timeAgo(paste.createdAt)}</span>
                  <span className="text-neutral-600">|</span>
                  <span>{bytesToKilobytes(paste.size)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex gap-2">
            <GlobeIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>Nothing here yet</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LastestPastes;
