import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { OFFRES } from "@/api/endpoints";

/**
 * Hook pour lister les offres avec filtres et pagination
 */
export function useOffres(filters = {}) {
  const params = new URLSearchParams();
  const actualFilters = filters || {};
  Object.entries(actualFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, value);
    }
  });
  const key = `${OFFRES.BASE}?${params.toString()}`;

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
    offres: data?.data ?? [],
    meta: data?.meta ?? {},
    isLoading,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook pour récupérer le détail d'une offre
 */
export function useOffre(id) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? OFFRES.DETAIL(id) : null,
    fetcher,
  );
  return {
    offre: data?.offre ?? data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Créer une offre (recruteur)
 */
export async function createOffre(payload) {
  const { data } = await api.post(OFFRES.BASE, payload);
  return data;
}

/**
 * Modifier une offre (recruteur)
 */
export async function updateOffre(id, payload) {
  const { data } = await api.put(OFFRES.DETAIL(id), payload);
  return data;
}

/**
 * Supprimer une offre (recruteur)
 */
export async function deleteOffre(id) {
  await api.delete(OFFRES.DETAIL(id));
}
