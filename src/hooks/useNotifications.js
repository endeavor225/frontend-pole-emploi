import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { NOTIFICATIONS } from "@/api/endpoints";

export function useNotifications(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? NOTIFICATIONS.BASE : null, // null = pas de fetch
    fetcher,
    {
      refreshInterval: enabled ? 60000 : 0,
    },
  );

  const notifications = data?.data ?? data ?? [];
  const unreadCount = notifications.filter((n) => !n.lu).length;

  return { notifications, unreadCount, isLoading, isError: !!error, mutate };
}

export async function markAsRead(id) {
  const { data } = await api.patch(NOTIFICATIONS.READ(id));
  return data;
}

export async function markAllAsRead() {
  const { data } = await api.patch(NOTIFICATIONS.READ_ALL);
  return data;
}
