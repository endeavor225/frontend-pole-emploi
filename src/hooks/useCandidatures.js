import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { CANDIDATURES } from "@/api/endpoints";

export function useCandidatures(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, value);
    }
  });
  const key = `${CANDIDATURES.BASE}?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    candidatures: data?.data ?? [],
    meta: data?.meta ?? {},
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useCandidature(id) {
  const { data, error, isLoading } = useSWR(
    id ? CANDIDATURES.DETAIL(id) : null,
    fetcher,
  );
  return { candidature: data, isLoading, isError: !!error };
}

export async function postuler(offreId) {
  const { data } = await api.post(CANDIDATURES.BASE, { offreId });
  return data;
}

export async function updateStatutCandidature(id, statut) {
  const { data } = await api.put(CANDIDATURES.UPDATE(id), { statut });
  return data;
}

export async function annulerCandidature(id) {
  await api.delete(CANDIDATURES.DETAIL(id));
}
