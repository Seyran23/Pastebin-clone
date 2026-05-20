import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { IRelatedPage } from '@/lib/types';
import { useAuthStore } from "@/store/useAuthStore";

const RelatedPages = ({ links }: { links: IRelatedPage[] }) => {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const visibleLinks = links.filter((link) => link.href !== pathname);

  return (
    <div className="relative md:w-64 border border-zinc-700 bg-neutral-800 rounded-md self-start">
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-neutral-800 px-2 text-xs text-zinc-300 font-semibold whitespace-nowrap">
        {user?.isActivated ? "ACCOUNT RELATED PAGES" : "RELATED PAGES"}
      </div>
      <div className="p-4 pt-6 space-y-2">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block bg-zinc-800 text-white px-4 py-2 rounded-md transition-colors hover:bg-zinc-700 w-full"
          >
            {link.label}?
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPages;
