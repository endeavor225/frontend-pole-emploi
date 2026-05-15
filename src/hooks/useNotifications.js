import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
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
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return { notifications, unreadCount, isLoading, isError: !!error, mutate };
}

export function useNotificationsInfinite(limit = 10) {
  const getKey = (pageIndex, previousPageData) => {
    // pageIndex est 0-indexed, le backend attend 1-indexed
    const page = pageIndex + 1;

    // Si on a atteint la fin
    if (previousPageData && !previousPageData.data?.length) return null;

    return `${NOTIFICATIONS.BASE}?page=${page}&limit=${limit}`;
  };

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite(getKey, fetcher, {
      refreshInterval: 60000,
    });

  const notifications = data ? data.flatMap((page) => page.data ?? []) : [];

  const isLoadingInitial = !data && !error;
  const isLoadingMore =
    isLoadingInitial ||
    (size > 0 && data && typeof data[size - 1] === "undefined");

  const lastPage = data ? data[data.length - 1] : null;
  const total = data?.[0]?.meta?.total ?? 0;

  const isReachingEnd =
    data?.[0]?.data?.length === 0 ||
    (lastPage?.meta && lastPage.meta.current_page >= lastPage.meta.last_page) ||
    (notifications.length >= total && total > 0);

  const unreadCount = data?.[0]?.meta?.unreadCount ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    isError: !!error,
    size,
    setSize,
    isReachingEnd,
    mutate,
    isValidating,
  };
}

export async function markAsRead(id) {
  const { data } = await api.patch(NOTIFICATIONS.READ(id));
  return data;
}

export async function markAllAsRead() {
  const { data } = await api.patch(NOTIFICATIONS.READ_ALL);
  return data;
}
