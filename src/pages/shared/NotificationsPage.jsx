import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";
import {
  useNotificationsInfinite,
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
  Loader2,
} from "lucide-react";
import { mutate as globalMutate } from "swr";
import { NOTIFICATIONS } from "@/api/endpoints";
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
  const loaderRef = useRef(null);

  const {
    notifications,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    setSize,
    mutate,
    isValidating,
  } = useNotificationsInfinite(15);

  const unreadCount = notifications.filter((n) => !n.lu).length;

  const handleNotificationClick = async (n) => {
    if (!n.lu) {
      try {
        await markAsRead(n.id);
        mutate();
        globalMutate(NOTIFICATIONS.BASE);
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
      globalMutate(NOTIFICATIONS.BASE);
    } catch {
      toast.error("Erreur lors du marquage des notifications");
    }
  };

  // Infinite Scroll Observer
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isReachingEnd && !isLoadingMore) {
        setSize((prev) => prev + 1);
      }
    },
    [isReachingEnd, isLoadingMore, setSize],
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  if (isLoading && notifications.length === 0) {
    return <LoadingSpinner text="Chargement de vos notifications..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Vous êtes à jour !"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="rounded-full px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
          >
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
        <div className="space-y-3 pb-10">
          {notifications.map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <Card
                key={n.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-none",
                  !n.lu ? "bg-primary/5 ring-1 ring-primary/10" : "bg-white/50",
                )}
                onClick={() => handleNotificationClick(n)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "rounded-2xl p-2.5 shrink-0",
                        !n.lu
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm sm:text-base leading-none",
                            !n.lu
                              ? "font-bold text-foreground"
                              : "font-medium text-muted-foreground",
                          )}
                        >
                          {n.titre || "Notification"}
                        </p>
                        {!n.lu && (
                          <Badge className="bg-primary text-[10px] uppercase font-bold tracking-wider px-2 h-5">
                            Nouveau
                          </Badge>
                        )}
                      </div>

                      {n.contenu && (
                        <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
                          {n.contenu}
                        </p>
                      )}

                      <p className="text-xs font-medium text-muted-foreground/60 pt-1">
                        {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Infinite Scroll Trigger */}
          <div
            ref={loaderRef}
            className={cn(
              "flex justify-center p-8 min-h-[80px]",
              isReachingEnd && "hidden",
            )}
          >
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-primary font-medium bg-primary/5 px-4 py-2 rounded-full animate-in fade-in zoom-in">
                <Loader2 className="h-5 w-5 animate-spin" />
                Chargement...
              </div>
            )}
          </div>

          {isReachingEnd && notifications.length > 0 && (
            <p className="text-center text-sm text-muted-foreground font-medium py-10">
              Vous avez vu toutes vos notifications.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
