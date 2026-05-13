"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { CalendarDays, CircleUserRound, Star } from "lucide-react";
import Link from "next/link";
import { bytesToKilobytes } from "@/lib/utils";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"; // Example theme
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// import { useQuery } from "@tanstack/react-query";
// import { searchPastesService } from "@/lib/api"; // your paginated search API
import { Loader2 } from "lucide-react";
import CategoryFilter from "@/components/CategoryFilter";
import { SearchPastesQuery } from "@/lib/models";
import { useSearchPastes } from "@/hooks/useSearch";


// const mockPastes = {
//     "data": [
//         {
//             "id": "37414ef6-d51d-4ae1-bc19-1bdd29f080ee",
//             "name": "Database Migration Script",
//             "link": "gNjJR6Ir",
//             "size": 435,
//             "createdAt": "2025-05-01T06:07:33.611Z",
//             "expiresAt": "1761631653609",
//             "category": "Photo",
//             "syntaxHighlight": "CSS",
//             "author": "carla_green",
//             "content": "CREATE TABLE users (\n    id SERIAL PRIMARY KEY,\n    username VARCHAR(50) UNIQUE NOT NULL,\n    email VARCHAR(100) UNIQUE NOT NULL,\n    password_hash VARCHAR(100) NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);\n\nCREATE INDEX idx_users_email ON users(email);\n\nCREATE TRIGGER update_user_timestamp\nBEFORE UPDATE ON users\nFOR EACH ROW\nEXECUTE PROCEDURE update_timestamp();",
//             "contentType": "text/plain",
//             "remainingTime": 13907233500,
//             "starCount": 0
//         },
//         {
//             "id": "40e2cd8e-1222-4931-85a1-904eea4f7839",
//             "name": "CSS Grid Template",
//             "link": "0qkRShiC",
//             "size": 292,
//             "createdAt": "2025-05-01T05:50:12.520Z",
//             "expiresAt": "1748670612519",
//             "category": "Pets",
//             "syntaxHighlight": "C#",
//             "author": "ravan",
//             "content": ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 2rem;\n  padding: 1.5rem;\n  max-width: 1200px;\n  margin: 0 auto;\n}\n\n.grid-item {\n  background: #ffffff;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n  padding: 1.5rem;\n}",
//             "contentType": "text/plain",
//             "remainingTime": 946192400,
//             "starCount": 0
//         },
//         {
//             "id": "6ced6a15-5bc4-4f80-b265-af0708905d17",
//             "name": "API Rate Limiter Config",
//             "link": "ssDaDiAL",
//             "size": 250,
//             "createdAt": "2025-05-01T05:48:36.388Z",
//             "expiresAt": null,
//             "category": "Money",
//             "syntaxHighlight": "C",
//             "author": "ravan",
//             "content": "const rateLimit = require('express-rate-limit');\n\nconst apiLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n  message: 'Too many requests from this IP, please try again after 15 minutes',\n  headers: true\n});\n\nmodule.exports = apiLimiter;",
//             "contentType": "text/plain",
//             "remainingTime": null,
//             "starCount": 0
//         }
//     ],
//     "pagination": {
//         "hasNextPage": false,
//         "hasPrevPage": false,
//         "nextCursor": null,
//         "prevCursor": "2025-05-01T06:07:33.611Z",
//         "itemsPerPage": 10
//     }
// }

// Then in your JSX, replace {pastes} with {mockPastes}
dayjs.extend(advancedFormat);


export default function SearchPage() {
    const router = useRouter();
    const params = useSearchParams();

    // sync URL → state
    const urlQ = params.get("q") || "";
    const urlCategory = params.get("category") || "all";
    const urlTime = params.get("time") || "all";
    const urlSort = params.get("sort") || "newest";

    const [q, setQ] = useState(urlQ);
    const [category, setCategory] = useState(urlCategory);
    const [time, setTime] = useState(urlTime);
    const [sort, setSort] = useState(urlSort);
    const [cursor, setCursor] = useState<string | undefined>(undefined);

    const [searchQuery, setSearchQuery] = useState<SearchPastesQuery | null>(null);


    useEffect(() => {
        setQ(urlQ);
        setCategory(urlCategory);
        setTime(urlTime);
        setSort(urlSort);
        setCursor(undefined);
    }, [urlQ, urlCategory, urlTime, urlSort]);

    // build query

    // fetch
    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useSearchPastes(searchQuery!, !!searchQuery);


    // only fire on button click
    const doSearch = () => {
        const base = "/search";
        const parts = new URLSearchParams();
        if (q) parts.set("q", q);
        if (category !== "all") parts.set("category", category);
        if (time !== "all") parts.set("time", time);
        if (sort !== "newest") parts.set("sort", sort);
        router.push(`${base}?${parts.toString()}`);

        const newQuery: SearchPastesQuery = {
            searchTerm: q,
            category: category !== "all" ? category : undefined,
            time: time !== "all" ? (time as any) : undefined,
            sort: sort as any,
            limit: 10,
            direction: "next",
            cursor: undefined,
        };

        setCursor(undefined);
        setSearchQuery(newQuery);  // triggers fetch
    };


    return (
        <div className="container max-w-[1024px] mx-auto px-4 text-white">
            {/* ——— Search & Filters ——— */}
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search pastes…"
                        value={q}
                        onChange={(e) => setQ(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === "Enter" && doSearch()}
                        className="flex-1 text-lg"
                    />
                    <Button onClick={doSearch}>Search</Button>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <CategoryFilter value={category} onChange={setCategory} />

                    <Select value={time} onValueChange={setTime}>
                        <SelectTrigger className="w-32"><SelectValue placeholder="Time" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any time</SelectItem>
                            <SelectItem value="day">Last day</SelectItem>
                            <SelectItem value="week">Last week</SelectItem>
                            <SelectItem value="month">Last month</SelectItem>
                            <SelectItem value="year">Last year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                            <SelectItem value="comments">Most comments</SelectItem>
                            <SelectItem value="likes">Most likes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center mt-10">
                    <Loader2 className="animate-spin w-10 h-10" />

                </div>
            )}
            {isError && (
                <p className="text-center text-red-400">Failed to fetch pastes.</p>
            )}
            {data && data.data.length === 0 && (
                <p className="text-center text-neutral-400 mt-2">No results found.</p>
            )}

            <div className="mt-8 space-y-4">
                {data?.data.map((paste) => (
                    <div
                        key={paste.id}
                        className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-750 transition-colors"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">{paste.name}</h2>
                            <Link href={`/${paste.link}`}>
                                <Button size="sm">View</Button>
                            </Link>
                        </div>
                        <div className="flex gap-4 text-gray-400 text-xs mb-2 flex-wrap">
                            <div className="flex items-center gap-1">
                                <CircleUserRound size={18} />
                                {paste.author.toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1">
                                <CalendarDays size={18} />
                                {dayjs(paste.createdAt).format("MMM Do, YYYY")}
                            </div>
                            <div className="flex items-center gap-1">
                                <Star size={18} /> {paste.likes}
                            </div>
                        </div>
                        {/* Code Preview */}


                        <div className="flex flex-col border border-zinc-600 rounded-sm mt-4 overflow-hidden">
                            <div className="text-xs flex flex-wrap  items-center gap-3 border-b border-zinc-600 p-3 text-center">
                                <span className="text-blue-300 bg-neutral-800 rounded-sm px-2 py-0.5">
                                    {paste.syntaxHighlight.toUpperCase()}
                                </span>
                                <span>{bytesToKilobytes(paste.size)}</span>
                                <span>|</span>
                                <span>{paste.category}</span>
                                <span>|</span>
                            </div>
                            <SyntaxHighlighter
                                language={paste.syntaxHighlight}
                                style={dracula}
                                showLineNumbers
                                customStyle={{
                                    padding: "1rem",
                                    margin: 0,
                                    maxHeight: "200px",
                                    overflow: "hidden",
                                    background: "#1e1e1e",
                                }}
                            >
                                {paste.content}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                ))}
            </div>

            {/* ——— Pagination Controls ——— */}
            {data?.pagination && (
                <div className="flex justify-between items-center mt-8">
                    <Button
                        disabled={!data.pagination.hasPrevPage}
                        onClick={() => setCursor(data.pagination.prevCursor!)}
                    >
                        ← Previous
                    </Button>
                    <span className="text-sm text-neutral-400">
                        Page size: {data.pagination.itemsPerPage}
                    </span>
                    <Button
                        disabled={!data.pagination.hasNextPage}
                        onClick={() => setCursor(data.pagination.nextCursor!)}
                    >
                        Next →
                    </Button>
                </div>
            )}
        </div>
    );
}
