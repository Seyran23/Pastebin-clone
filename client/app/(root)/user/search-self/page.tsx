// app/user/[username]/search-self/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import PastesTable from "@/components/PastesTable";
import { searchSelfPastes } from "@/lib/api";
import { Loader2 } from "lucide-react";
import InfoBox from "@/components/InfoBox";
import { useState } from "react";

export default function SearchSelfPage() {
    const params = useSearchParams();
    // initialize both from URL ?query=
    const initial = params.get("query") ?? "";

    const [inputTerm, setInputTerm] = useState(initial);
    const [searchTerm, setSearchTerm] = useState(initial);

    const {
        data: pastes,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["searchSelf", searchTerm],
        queryFn: () => searchSelfPastes(searchTerm),
        enabled: !!searchTerm,
    });

    const doSearch = () => {
        const t = inputTerm.trim();
        if (!t) return;
        setSearchTerm(t);
        refetch();
    };

    return (
        <div className="container max-w-[1024px] mx-auto px-4 text-white">
            <div className="flex items-center justify-between border-zinc-600 border-b pb-3 mb-4">
                <p className="text-lg font-bold">
                    Your pastes matching: <span className="text-sky-300 underline">{searchTerm}</span>
                </p>
                <Input
                    placeholder="Search your own pastes…"
                    value={inputTerm}
                    onChange={(e) => setInputTerm(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    className="border-zinc-700 focus:outline-none focus:ring-0 text-sm w-64"
                />
            </div>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-neutral-500" size={24} />
                </div>
            )}

            {isError && (
                <p className="text-red-400">Failed to fetch your pastes.</p>
            )}

            {!isLoading && pastes?.length === 0 && (
                <InfoBox className="text-white">There are no pastes matching your query.</InfoBox>
            )}

            {pastes && pastes.length > 0 && (
                <PastesTable pastes={pastes} />
            )}
        </div>
    );
}
