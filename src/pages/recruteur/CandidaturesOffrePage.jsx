import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOffre } from "@/hooks/useOffres";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { updateStatutCandidature } from "@/hooks/useCandidatures";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { STATUTS_CANDIDATURE, STATUT_CANDIDATURE } from "@/lib/constants";
import { API_BASE, cn } from "@/lib/utils";
import CandidateCard from "@/components/features/CandidateCard";

/* ── Composant Stat Card ── */
function SummaryCard({ label, value, icon: Icon, colorClass }) {
  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-2.5 rounded-xl transition-colors", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CandidaturesOffrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    offre,
    isLoading: offreLoading,
    mutate: mutateOffre,
  } = useOffre(`${id}?candidatures=true`);

  const candidatures = useMemo(() => offre?.candidatures || [], [offre]);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);

  const domaines = useMemo(
    () => domainesData?.data || domainesData || [],
    [domainesData],
  );
  const niveaux = useMemo(
    () => niveauxData?.data || niveauxData || [],
    [niveauxData],
  );

  /* Statistiques */
  const stats = useMemo(() => {
    return {
      total: candidatures.length,
      pending: candidatures.filter(
        (c) => c.statut === STATUT_CANDIDATURE.EN_ATTENTE,
      ).length,
      accepted: candidatures.filter(
        (c) => c.statut === STATUT_CANDIDATURE.ACCEPTEE,
      ).length,
      rejected: candidatures.filter(
        (c) => c.statut === STATUT_CANDIDATURE.REFUSEE,
      ).length,
    };
  }, [candidatures]);

  /* Filtrage */
  const filteredCandidatures = useMemo(() => {
    return candidatures.filter((c) => {
      const candidat = c.candidat || c.user || {};
      const prenom = candidat.user?.prenom || candidat.prenom || "";
      const nom = candidat.user?.nom || candidat.nom || "";
      const fullName = `${prenom} ${nom}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || c.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [candidatures, searchTerm, statusFilter]);

  const handleStatutChange = async (candidatureId, newStatut) => {
    setUpdatingId(candidatureId);
    try {
      await updateStatutCandidature(candidatureId, newStatut);
      toast.success("Statut mis à jour avec succès");
      mutateOffre();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const isLoading = offreLoading;

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner text="Chargement des candidatures..." />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Action Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="mb-5"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Candidatures
            </h1>
            {offre && (
              <Badge className="bg-primary/10 text-primary border-none text-xs px-2.5 py-0.5">
                {offre.titre}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
            <Briefcase className="w-3.5 h-3.5" />
            Suivi des postulants pour votre offre active.
          </p>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total"
          value={stats.total}
          icon={Users}
          colorClass="bg-purple-100 text-purple-600"
        />
        <SummaryCard
          label="À traiter"
          value={stats.pending}
          icon={Clock}
          colorClass="bg-amber-100 text-amber-600"
        />
        <SummaryCard
          label="Acceptées"
          value={stats.accepted}
          icon={CheckCircle2}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <SummaryCard
          label="Refusées"
          value={stats.rejected}
          icon={XCircle}
          colorClass="bg-rose-100 text-rose-600"
        />
      </div>

      {/* ── Filters Bar ── */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Rechercher un candidat..."
              className="pl-9 h-11 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("ALL")}
              className="rounded-full h-8 text-xs font-bold uppercase transition-all duration-200"
            >
              Tous
            </Button>
            {STATUTS_CANDIDATURE.map((s) => (
              <Button
                key={s.value}
                variant={statusFilter === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s.value)}
                className="rounded-full h-8 text-xs font-bold uppercase transition-all duration-200"
              >
                {s.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Candidates List ── */}
      {candidatures.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucune candidature"
          description="Votre offre n'a pas encore reçu de candidatures pour le moment."
        />
      ) : filteredCandidatures.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun résultat"
          description={`Aucun candidat ne correspond aux filtres actuels.`}
        />
      ) : (
        <div className="grid gap-4">
          {filteredCandidatures.map((c) => (
            <CandidateCard
              key={c.id}
              candidature={c}
              domaines={domaines}
              niveaux={niveaux}
              onStatusChange={handleStatutChange}
              isUpdating={updatingId === c.id}
              apiBase={API_BASE}
            />
          ))}
        </div>
      )}
    </div>
  );
}
