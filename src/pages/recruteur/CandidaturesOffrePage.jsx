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
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { STATUTS_CANDIDATURE, STATUT_CANDIDATURE } from "@/lib/constants";
import { CANDIDATURES } from "@/api/endpoints";
import { cn } from "@/lib/utils";

/* ── Composant Stat Card ── */
function SummaryCard({ label, value, icon: Icon, colorClass }) {
  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-2.5 rounded-xl transition-colors", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CandidaturesOffrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { offre, isLoading: offreLoading } = useOffre(id);

  const {
    data: candidaturesData,
    isLoading: candLoading,
    mutate,
  } = useSWR(id ? `${CANDIDATURES.BASE}?offreId=${id}` : null, fetcher);

  const candidatures = useMemo(() => candidaturesData?.data || candidaturesData || [], [candidaturesData]);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* Statistiques */
  const stats = useMemo(() => {
    return {
      total: candidatures.length,
      pending: candidatures.filter(c => c.statut === STATUT_CANDIDATURE.EN_ATTENTE).length,
      accepted: candidatures.filter(c => c.statut === STATUT_CANDIDATURE.ACCEPTEE).length,
      rejected: candidatures.filter(c => c.statut === STATUT_CANDIDATURE.REFUSEE).length,
    };
  }, [candidatures]);

  /* Filtrage */
  const filteredCandidatures = useMemo(() => {
    return candidatures.filter(c => {
      const candidat = c.candidat || c.user || {};
      const fullName = `${candidat.prenom} ${candidat.nom}`.toLowerCase();
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
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const isLoading = offreLoading || candLoading;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner text="Chargement des candidatures..." />
    </div>
  );

  const getInitials = (user) => {
    if (!user) return "?";
    return `${(user.prenom || "")[0] || ""}${(user.nom || "")[0] || ""}`.toUpperCase();
  };

  const getStatutStyles = (statut) => {
    switch (statut) {
      case STATUT_CANDIDATURE.ACCEPTEE:
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case STATUT_CANDIDATURE.REFUSEE:
        return "bg-rose-50 text-rose-600 border-rose-200";
      case STATUT_CANDIDATURE.EN_ATTENTE:
        return "bg-amber-50 text-amber-600 border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Action Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="group -ml-3 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            Retour au catalogue
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Candidatures</h1>
            {offre && <Badge className="bg-primary/10 text-primary border-none text-xs px-2.5 py-0.5">{offre.titre}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
            <BriefcaseIcon className="w-3.5 h-3.5" />
            Suivi des postulants pour votre offre active.
          </p>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={stats.total} icon={Users} colorClass="bg-purple-100 text-purple-600" />
        <SummaryCard label="À traiter" value={stats.pending} icon={Clock} colorClass="bg-amber-100 text-amber-600" />
        <SummaryCard label="Acceptées" value={stats.accepted} icon={CheckCircle2} colorClass="bg-emerald-100 text-emerald-600" />
        <SummaryCard label="Refusées" value={stats.rejected} icon={XCircle} colorClass="bg-rose-100 text-rose-600" />
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
            {STATUTS_CANDIDATURE.map(s => (
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
          {filteredCandidatures.map((c) => {
            const candidat = c.candidat || c.user || {};
            return (
              <Card key={c.id} className="group border-none shadow-sm hover:ring-2 hover:ring-primary/20 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-14 w-14 ring-4 ring-muted group-hover:ring-primary/10 transition-all">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                          {getInitials(candidat)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors">
                            {candidat.prenom} {candidat.nom}
                          </h3>
                          <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0", getStatutStyles(c.statut))}>
                            {STATUTS_CANDIDATURE.find(s => s.value === c.statut)?.label || c.statut}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-primary/60" /> {candidat.email}</span>
                          {candidat.telephone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-primary/60" /> {candidat.telephone}</span>}
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary/60" /> Postulé le {new Date(c.createdAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-muted">
                      {candidat.curriculumVitae && (
                        <Button variant="outline" size="sm" className="rounded-xl flex-1 lg:flex-none h-10 px-4 group/cv" asChild>
                           <a href={candidat.curriculumVitae} target="_blank" rel="noopener noreferrer">
                             <FileText className="h-4 w-4 mr-2 text-primary group-hover/cv:scale-110 transition-transform" /> CV
                           </a>
                        </Button>
                      )}
                      
                      <div className="relative flex items-center gap-2 flex-1 lg:flex-none">
                        <Select
                          value={c.statut}
                          onValueChange={(v) => handleStatutChange(c.id, v)}
                          disabled={updatingId === c.id}
                        >
                          <SelectTrigger className="h-10 w-full lg:w-[160px] rounded-xl border-none bg-muted/40 font-semibold focus:ring-2 focus:ring-primary/20 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-xl">
                            {STATUTS_CANDIDATURE.map((s) => (
                              <SelectItem key={s.value} value={s.value} className="rounded-lg my-0.5">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {updatingId === c.id && (
                          <div className="absolute -right-7">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>

                      <Button variant="default" size="sm" className="rounded-xl flex-1 lg:flex-none h-10 px-4 bg-(--color-cta) hover:opacity-90 shadow-sm" asChild>
                        <Link to={`/messages/${candidat.id || candidat.userId}`} className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> Message
                        </Link>
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

function BriefcaseIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

