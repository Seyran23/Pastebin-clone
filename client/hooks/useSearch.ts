import { searchPastes } from "@/lib/api";
import { SearchPastesQuery } from "@/lib/models";
import { useQuery } from "@tanstack/react-query";

export function useSearchPastes(opts: SearchPastesQuery, enabled: boolean = false) {
  return useQuery({
    queryKey: ["searchPastes", opts],
    queryFn: () => searchPastes(opts),
    enabled, // only fetch if enabled === true
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}
