import { useState } from "react";
import { Link } from "react-router-dom";
import { useCandidatures, annulerCandidature } from "@/hooks/useCandidatures";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Building2,
  MapPin,
  Calendar,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { STATUTS_CANDIDATURE } from "@/lib/constants";

const statutVariant = (statut) => {
  switch (statut) {
    case "ACCEPTEE":
      return "default";
    case "REFUSEE":
      return "destructive";
    case "EN_ATTENTE":
      return "secondary";
    default:
      return "outline";
  }
};

const statutLabel = (statut) => {
  const found = STATUTS_CANDIDATURE.find((s) => s.value === statut);
  return found?.label || statut;
};

export default function MesCandidaturesPage() {
  const { candidatures, isLoading, mutate } = useCandidatures();
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await annulerCandidature(cancelTarget.id);
      toast.success("Candidature annulée");
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  if (isLoading)
    return <LoadingSpinner text="Chargement de vos candidatures…" />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mes candidatures</h1>
        <p className="mt-1 text-muted-foreground">
          {candidatures.length} candidature{candidatures.length > 1 ? "s" : ""}{" "}
          envoyée{candidatures.length > 1 ? "s" : ""}
        </p>
      </div>

      {candidatures.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucune candidature"
          description="Parcourez les offres et postulez pour commencer."
        >
          <Button asChild>
            <Link to="/offres">Voir les offres</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidatures.map((c) => {
            const offre = c.offre || {};
            const entreprise = offre.entreprise || {};
            return (
              <Card key={c.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">
                      <Link
                        to={`/offres/${offre.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {offre.titre || "Offre"}
                      </Link>
                    </CardTitle>
                    <Badge variant={statutVariant(c.statut)}>
                      {statutLabel(c.statut)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pb-3">
                  {entreprise.nomEntreprise && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{entreprise.nomEntreprise}</span>
                    </div>
                  )}
                  {offre.localisation && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{offre.localisation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Posturé le{" "}
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link to={`/offres/${offre.id}`}>
                      <ExternalLink className="mr-1 h-3 w-3" /> Voir l'offre
                    </Link>
                  </Button>
                  {c.statut === "EN_ATTENTE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelTarget(c)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler cette candidature ?</DialogTitle>
            <DialogDescription>
              Votre candidature pour « {cancelTarget?.offre?.titre} » sera
              annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Non
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Annulation…
                </>
              ) : (
                "Oui, annuler"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
