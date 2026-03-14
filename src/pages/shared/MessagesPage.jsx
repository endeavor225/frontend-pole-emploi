import { Link } from "react-router-dom";
import { useConversations } from "@/hooks/useMessages";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { conversations, isLoading } = useConversations();

  if (isLoading) return <LoadingSpinner text="Chargement…" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="mt-1 text-muted-foreground">
          {conversations.length} conversation
          {conversations.length > 1 ? "s" : ""}
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun message"
          description="Commencez une conversation depuis le profil d'un candidat ou d'un recruteur."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.otherUser || conv.interlocuteur || {};
            const lastMsg = conv.lastMessage || conv.dernierMessage || {};
            const initials =
              `${(other.prenom || "")[0] || ""}${(other.nom || "")[0] || ""}`.toUpperCase();

            return (
              <Link key={conv.id || other.id} to={`/messages/${other.id}`}>
                <Card className="transition-colors hover:bg-accent cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                          {initials || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {other.prenom} {other.nom}
                          </p>
                          {lastMsg.createdAt && (
                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                              {new Date(lastMsg.createdAt).toLocaleDateString(
                                "fr-FR",
                              )}
                            </span>
                          )}
                        </div>
                        {lastMsg.contenu && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMsg.contenu}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground font-bold px-1.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
