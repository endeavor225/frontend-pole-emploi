import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { ENTREPRISES } from "@/api/endpoints";

/**
 * Hook pour récupérer le détail d'une entreprise
 */
export function useEntreprise(id) {
  const { data, error, isLoading } = useSWR(
    id ? ENTREPRISES.DETAIL(id) : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    entreprise: data?.entreprise ?? data ?? null,
    isLoading,
    isError: !!error,
    error,
  };
}

/**
 * Hook pour lister les entreprises (recherche, filtres, pagination)
 */
export function useEntreprisesList(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, value);
    }
  });

  const key = `${ENTREPRISES.BASE}?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      keepPreviousData: true,
    },
  );

  return {
    entreprises: data?.data ?? [],
    meta: data?.meta ?? {},
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}
