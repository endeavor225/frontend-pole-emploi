import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { DOMAINES } from "@/api/endpoints";

/**
 * Hook pour récupérer la liste des domaines d'activité
 */
export function useDomaines() {
  const { data, error, isLoading } = useSWR(DOMAINES.BASE, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // cache 1 min
  });

  return {
    domaines: data?.data ?? data ?? [],
    isLoading,
    isError: !!error,
  };
}
