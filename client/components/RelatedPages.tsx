import { IRelatedPage } from "@/lib/models";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import React from "react";

const RelatedPages = ({ links }: { links: IRelatedPage[] }) => {
  const {user} = useAuthStore()

  return (
    <div className="relative md:w-64 border border-zinc-700 bg-neutral-800 rounded-md self-start">
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-neutral-800 px-2 text-xs text-zinc-300 font-semibold whitespace-nowrap">
        {user?.isActivated ? "ACCOUNT RELATED PAGES" : "RELATED PAGES"}
      </div>
      <div className="p-4 pt-6 space-y-2">
        {links.map((link) => (
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
