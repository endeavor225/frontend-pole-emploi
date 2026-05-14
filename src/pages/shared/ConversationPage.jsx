import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useMessages,
  sendMessage,
  markConversationAsRead,
} from "@/hooks/useMessages";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { cn, API_BASE } from "@/lib/utils";
import { toast } from "sonner";
import CompanyAvatar from "@/components/shared/CompanyAvatar";

/**
 * Retourne un label de date en français :
 * - "Aujourd'hui", "Hier", "Avant-hier"
 * - Nom du jour (lundi, mardi…) pour les jours de la semaine en cours
 * - Format abrégé (ex: "dim. 1 mars") pour les dates plus anciennes
 */
function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  // Normaliser à minuit pour comparer les jours
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays === 2) return "Avant-hier";

  // Jours récents de la même semaine (jusqu'à 6 jours)
  if (diffDays <= 6) {
    return date.toLocaleDateString("fr-FR", { weekday: "long" });
  }

  // Dates plus anciennes : "dim. 1 mars" ou "dim. 1 mars 2025" si année différente
  const parts = { weekday: "short", day: "numeric", month: "long" };
  if (date.getFullYear() !== now.getFullYear()) {
    parts.year = "numeric";
  }
  return date.toLocaleDateString("fr-FR", parts);
}

/** Clé de regroupement (YYYY-MM-DD) */
function getDateKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Regroupe les messages par date.
 * Retourne un tableau de { dateKey, label, messages[] }
 */
function groupMessagesByDate(messages) {
  const groups = [];
  let currentKey = null;

  for (const msg of messages) {
    const key = getDateKey(msg.createdAt);
    if (key !== currentKey) {
      currentKey = key;
      groups.push({
        dateKey: key,
        label: getDateLabel(msg.createdAt),
        messages: [],
      });
    }
    groups[groups.length - 1].messages.push(msg);
  }

  return groups;
}

export default function ConversationPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.user);
  const { messages, isLoading, mutate } = useMessages(userId);

  // Fallback info from navigation state
  const otherFromState = location.state?.otherUser;

  // Identify the other user for the header
  const otherUser = useMemo(() => {
    let user = null;
    if (messages.length > 0) {
      const first = messages[0];
      user = first.senderId === currentUser?.id ? first.receiver : first.sender;
    }

    // Fusionner les données du state avec celles des messages pour avoir le max d'infos
    // (Le state a souvent les infos d'entreprise/photo, les messages ont l'ID et les noms)
    if (otherFromState) {
      return {
        ...user,
        ...otherFromState,
        // On garde les objets imbriqués s'ils existent dans l'un ou l'autre
        entreprise: otherFromState.entreprise || user?.entreprise,
        candidat: otherFromState.candidat || user?.candidat,
      };
    }

    return user;
  }, [messages, currentUser?.id, otherFromState]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Marquer les messages comme lus quand la conversation s'ouvre
  useEffect(() => {
    if (userId && messages.length > 0) {
      // Vérifier s'il y a des messages non lus de l'interlocuteur
      const hasUnread = messages.some(
        (msg) => msg.senderId !== currentUser?.id && !msg.lu,
      );
      if (hasUnread) {
        markConversationAsRead(userId).catch(() => {});
      }
    }
  }, [userId, messages, currentUser?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage(userId, text.trim());
      setText("");
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="Chargement…" />;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mb-20">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {(() => {
          const companyName = otherUser?.entreprise?.nomEntreprise;
          const logo = otherUser?.entreprise?.logoPath;
          const photo = otherUser?.candidat?.photoPath;

          if (otherUser?.role === "RECRUTEUR" || !!companyName) {
            return (
              <CompanyAvatar
                name={companyName || "Entreprise"}
                logoPath={logo}
                size={32}
                className="rounded-full"
                objectCover
              />
            );
          }

          return (
            <Avatar className="h-8 w-8">
              {photo && (
                <AvatarImage
                  src={`${API_BASE}${photo}`}
                  alt={`${otherUser?.prenom} ${otherUser?.nom}`}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {(() => {
                  if (!otherUser) return "?";
                  if (otherUser.prenom && otherUser.nom) {
                    return `${otherUser.prenom[0]}${otherUser.nom[0]}`.toUpperCase();
                  }
                  return (otherUser.nom || otherUser.prenom || "?")[0].toUpperCase();
                })()}
              </AvatarFallback>
            </Avatar>
          );
        })()}
        <div>
          <p className="font-medium text-sm">
            {(() => {
              if (!otherUser) return "Conversation";

              const companyName = otherUser.entreprise?.nomEntreprise;

              // Priorité absolue au nom de l'entreprise pour les recruteurs
              if (otherUser.role === "RECRUTEUR" || companyName) {
                return companyName || "Entreprise";
              }

              // Sinon, prénom + nom pour les candidats
              if (otherUser.prenom && otherUser.nom) {
                return `${otherUser.prenom} ${otherUser.nom}`;
              }

              return otherUser.nom || otherUser.prenom || "Conversation";
            })()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Aucun message. Envoyez le premier !
          </p>
        ) : (
          groupMessagesByDate(messages).map((group) => (
            <div key={group.dateKey}>
              {/* Séparateur de date */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border opacity-35 " />
                <span className="text-xs font-medium text-muted-foreground px-2 capitalize">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-border opacity-35 " />
              </div>

              {/* Messages du groupe */}
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isMe ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[60%] rounded-2xl px-4 py-2.5",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm",
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.contenu}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isMe
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 border-t pt-4 mt-4"
      >
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Écrivez votre message…"
          disabled={sending}
          autoFocus
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !text.trim()}
          className="mb-1"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
