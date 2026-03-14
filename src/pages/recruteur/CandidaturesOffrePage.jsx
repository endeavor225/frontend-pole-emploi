import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOffre } from "@/hooks/useOffres";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { updateStatutCandidature } from "@/hooks/useCandidatures";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { STATUTS_CANDIDATURE } from "@/lib/constants";
import { CANDIDATURES } from "@/api/endpoints";

export default function CandidaturesOffrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { offre, isLoading: offreLoading } = useOffre(id);

  const {
    data: candidaturesData,
    isLoading: candLoading,
    mutate,
  } = useSWR(id ? `${CANDIDATURES.BASE}?offreId=${id}` : null, fetcher);

  const candidatures = candidaturesData?.data || candidaturesData || [];
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatutChange = async (candidatureId, newStatut) => {
    setUpdatingId(candidatureId);
    try {
      await updateStatutCandidature(candidatureId, newStatut);
      toast.success("Statut mis à jour");
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setUpdatingId(null);
    }
  };

  const isLoading = offreLoading || candLoading;

  if (isLoading) return <LoadingSpinner text="Chargement…" />;

  const getInitials = (user) => {
    if (!user) return "?";
    return `${(user.prenom || "")[0] || ""}${(user.nom || "")[0] || ""}`.toUpperCase();
  };

  const statutVariant = (statut) => {
    switch (statut) {
      case "ACCEPTEE":
        return "default";
      case "REFUSEE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Candidatures reçues</h1>
        {offre && (
          <p className="mt-1 text-muted-foreground">
            Pour l'offre «{" "}
            <Link to={`/offres/${id}`} className="text-primary hover:underline">
              {offre.titre}
            </Link>{" "}
            » — {candidatures.length} candidature
            {candidatures.length > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {candidatures.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucune candidature"
          description="Aucun candidat n'a encore postulé à cette offre."
        />
      ) : (
        <div className="space-y-4">
          {candidatures.map((c) => {
            const candidat = c.candidat || c.user || {};
            return (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(candidat)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {candidat.prenom} {candidat.nom}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {candidat.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" /> {candidat.email}
                            </span>
                          )}
                          {candidat.telephone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />{" "}
                              {candidat.telephone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />{" "}
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        value={c.statut}
                        onValueChange={(v) => handleStatutChange(c.id, v)}
                        disabled={updatingId === c.id}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUTS_CANDIDATURE.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === c.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/messages/${candidat.id}`}>Contacter</Link>
                      </Button>
                    </div>
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
