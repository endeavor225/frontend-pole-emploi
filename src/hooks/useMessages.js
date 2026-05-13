import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { MESSAGES } from "@/api/endpoints";
import { useAuthStore } from "@/store/authStore";

/**
 * Récupère tous les messages de l'utilisateur connecté
 * et les regroupe en conversations (par interlocuteur).
 */
export function useConversations() {
  const currentUser = useAuthStore((s) => s.user);

  // On récupère beaucoup de messages pour construire la liste de conversations
  const { data, error, isLoading, mutate } = useSWR(
    `${MESSAGES.BASE}?limit=200`,
    fetcher,
    { refreshInterval: 30000 },
  );

  // Les messages bruts retournés par le backend
  const rawMessages = data?.data ?? data ?? [];

  // Regrouper par interlocuteur
  const conversationsMap = {};
  if (currentUser) {
    for (const msg of rawMessages) {
      // Déterminer l'interlocuteur (l'autre personne)
      const isMe = msg.senderId === currentUser.id;
      const other = isMe ? msg.receiver : msg.sender;
      if (!other) continue;

      const otherId = other.id;

      if (!conversationsMap[otherId]) {
        conversationsMap[otherId] = {
          id: otherId,
          otherUser: other,
          interlocuteur: other,
          lastMessage: msg,
          dernierMessage: msg,
          unreadCount: 0,
        };
      }

      // Le dernier message est le plus récent (les messages sont triés desc)
      // Le premier rencontré est donc le plus récent

      // Compter les non-lus (messages reçus non lus)
      if (!isMe && !msg.lu) {
        conversationsMap[otherId].unreadCount += 1;
      }
    }
  }

  const conversations = Object.values(conversationsMap);
  const unreadCount = rawMessages.filter(
    (m) => m.receiverId === currentUser?.id && !m.lu,
  ).length;

  return {
    conversations,
    unreadCount,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * Récupère les messages d'une conversation avec un utilisateur spécifique.
 * Utilise le query param ?user_id= du backend index.
 */
export function useMessages(userId) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `${MESSAGES.BASE}?user_id=${userId}&limit=100` : null,
    fetcher,
    { refreshInterval: 10000 },
  );

  // Le backend retourne les messages en desc, on les inverse pour l'affichage chronologique
  const rawMessages = data?.data ?? data ?? [];
  const messages = [...rawMessages].reverse();

  return {
    messages,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * Envoyer un message à un utilisateur.
 * POST /messages avec { receiverId, contenu }
 */
export async function sendMessage(userId, contenu) {
  const { data } = await api.post(MESSAGES.BASE, {
    receiverId: userId,
    contenu,
  });
  return data;
}

/**
 * Marquer tous les messages d'une conversation comme lus.
 * PATCH /messages/conversation-read avec { sender_id }
 */
export async function markConversationAsRead(senderId) {
  const { data } = await api.patch(MESSAGES.CONVERSATION_READ, {
    sender_id: senderId,
  });
  return data;
}
