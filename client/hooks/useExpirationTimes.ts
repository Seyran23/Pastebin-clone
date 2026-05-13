import { useQuery } from "@tanstack/react-query";
import { getExpirationTimes } from "@/lib/api";

export function useExpirationTimes() {
  return useQuery({
    queryKey: ["expirationTimes"],
    queryFn: getExpirationTimes,
    staleTime: 1000 * 60 * 10, 
  });
}
