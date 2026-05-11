import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useMessages,
  sendMessage,
  markConversationAsRead,
} from "@/hooks/useMessages";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ConversationPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { messages, isLoading, mutate } = useMessages(userId);
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
      console.log("🚀 ~ handleSend ~ error:", error.response?.data?.message);
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/messages")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {(() => {
              const first = messages[0];
              if (!first) return "?";
              const other =
                first.senderId === currentUser?.id
                  ? first.receiver
                  : first.sender;
              return other
                ? `${(other.prenom || "")[0]}${(other.nom || "")[0]}`.toUpperCase()
                : "?";
            })()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">
            {(() => {
              const first = messages[0];
              if (!first) return "Conversation";
              const other =
                first.senderId === currentUser?.id
                  ? first.receiver
                  : first.sender;
              return other ? `${other.prenom} ${other.nom}` : "Conversation";
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
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[60%] rounded-2xl px-4 py-2.5",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.contenu}</p>
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
          })
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
