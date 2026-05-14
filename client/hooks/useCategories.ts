import { useQuery } from "@tanstack/react-query";

import { getCategories } from '@/lib/api';

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,

    staleTime: 1000 * 60 * 5, // stay fresh for 5m
    gcTime: 1000 * 60 * 30, // keep cached for 30m
    refetchOnWindowFocus: false,
  });
}
