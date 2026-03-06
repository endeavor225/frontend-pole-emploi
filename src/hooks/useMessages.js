import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { MESSAGES } from "@/api/endpoints";

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWR(MESSAGES.BASE, fetcher, {
    refreshInterval: 30000,
  });
  return {
    conversations: data?.data ?? data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useMessages(userId) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? MESSAGES.CONVERSATION(userId) : null,
    fetcher,
    { refreshInterval: 10000 },
  );
  return {
    messages: data?.data ?? data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function sendMessage(userId, contenu) {
  const { data } = await api.post(MESSAGES.CONVERSATION(userId), { contenu });
  return data;
}
