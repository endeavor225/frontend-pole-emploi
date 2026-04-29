import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  markAsRead,
  markAllAsRead,
} from "@/hooks/useNotifications";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  BellOff,
  CheckCheck,
  FileText,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeIcon = (type) => {
  switch (type) {
    case "CANDIDATURE":
      return FileText;
    case "OFFRE":
      return Briefcase;
    case "MESSAGE":
      return MessageSquare;
    default:
      return Bell;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, mutate } = useNotifications();

  const handleNotificationClick = async (n) => {
    if (!n.lu) {
      try {
        await markAsRead(n.id);
        mutate();
      } catch (error) {
        console.error("Erreur lors du marquage comme lu:", error);
      }
    }
    if (n.lien) {
      navigate(n.lien);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success("Toutes les notifications marquées comme lues");
      mutate();
    } catch {
      toast.error("Erreur");
    }
  };

  if (isLoading) return <LoadingSpinner text="Chargement…" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Aucune notification"
          description="Vous n'avez pas encore de notification."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <Card
                key={n.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-accent/30",
                  !n.lu && "border-primary/30 bg-primary/5",
                )}
                onClick={() => handleNotificationClick(n)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "rounded-full p-2",
                        !n.lu
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm", !n.lu && "font-semibold")}>
                          {n.titre || "Notification"}
                        </p>
                      </div>

                      {n.contenu && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {n.contenu}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.lu && (
                      <Badge
                        variant="default"
                        className="shrink-0 text-xs px-2"
                      >
                        Nouveau
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
