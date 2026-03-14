import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ── Fonctions utilitaires ────────────────────────────────── */
export function timeAgo(date) {
  if (!date) return null;
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  } catch {
    return null;
  }
}

/* Formatage d'URL pour liens externes */
export const formatExternalUrl = (url) => {
  if (!url) return "#";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};
