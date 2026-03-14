import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { FAVORIS } from "@/api/endpoints";

export function useFavoris(isAuthenticated = true) {
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? FAVORIS.BASE : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  return {
    favoris: data?.data ?? data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function ajouterFavori(offreId) {
  const { data } = await api.post(FAVORIS.BASE, { offreId });
  return data;
}

export async function supprimerFavori(id) {
  await api.delete(FAVORIS.DETAIL(id));
}
