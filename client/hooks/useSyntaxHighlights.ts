import { useQuery } from "@tanstack/react-query";

import { getSyntaxHighlights } from '@/lib/api';

export function useSyntaxHighlights() {
  return useQuery({
    queryKey: ["syntaxHighlights"],
    queryFn: getSyntaxHighlights,
    staleTime: 1000 * 60 * 10, // cache for 10 minutes
  });
}
