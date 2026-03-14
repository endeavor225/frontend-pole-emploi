import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessages, sendMessage } from "@/hooks/useMessages";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
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
            {messages[0]?.interlocuteur
              ? `${(messages[0].interlocuteur.prenom || "")[0]}${(messages[0].interlocuteur.nom || "")[0]}`.toUpperCase()
              : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">
            {messages[0]?.interlocuteur
              ? `${messages[0].interlocuteur.prenom} ${messages[0].interlocuteur.nom}`
              : "Conversation"}
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
            const isMe =
              msg.senderId === currentUser?.id ||
              msg.expediteurId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
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
        className="flex items-center gap-2 border-t pt-4 mt-4"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrivez votre message…"
          disabled={sending}
          autoFocus
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !text.trim()}>
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
