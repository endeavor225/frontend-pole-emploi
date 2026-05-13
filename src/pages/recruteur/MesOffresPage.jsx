import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useOffres, deleteOffre } from "@/hooks/useOffres";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Users,
  Briefcase,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RecruiterJobCard from "@/components/features/RecruiterJobCard";

/* ── Composant Stat Card ── */
function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
          </div>
          <div className={cn("p-3 rounded-2xl", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MesOffresPage() {
  const { offres, isLoading, mutate } = useOffres({ candidatures: true });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* Calcul des statistiques */
  const stats = useMemo(() => {
    const total = offres.length;
    const totalCandidatures = offres.reduce(
      (acc, curr) =>
        acc + (curr.candidatures?.length || curr.candidaturesCount || 0),
      0,
    );
    // On considère "active" si pas de date limite ou date limite > aujourd'hui
    const actives = offres.filter((o) => {
      if (!o.dateLimite) return true;
      return new Date(o.dateLimite) > new Date();
    }).length;

    return { total, totalCandidatures, actives };
  }, [offres]);

  /* Filtrage des offres */
  const filteredOffres = useMemo(() => {
    return offres.filter((o) =>
      o.titre?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [offres, searchTerm]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOffre(deleteTarget.id);
      toast.success("Offre supprimée avec succès");
      mutate();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression",
      );
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (isLoading) return <LoadingSpinner text="Chargement de vos offres…" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Gestion des Offres
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Retrouvez et gérez toutes vos publications en temps réel.
          </p>
        </div>
        <Button asChild className="">
          <Link to="/recruteur/offres/nouvelle">
            <PlusCircle className="mr-2 h-5 w-5" /> Publier une offre
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Publications"
          value={stats.total}
          icon={Briefcase}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Candidatures Reçues"
          value={stats.totalCandidatures}
          icon={Users}
          colorClass="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Offres Actives"
          value={stats.actives}
          icon={CheckCircle2}
          colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Rechercher par titre de poste..."
          className="pl-10 h-12 bg-white/40 border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Offers Grid */}
      {offres.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="Aucune offre publiée"
          description="Votre catalogue est vide. Partagez votre première opportunité maintenant."
        >
          <Button asChild variant="outline" className="mt-4">
            <Link to="/recruteur/offres/nouvelle">
              <PlusCircle className="mr-2 h-4 w-4" /> Créer une offre
            </Link>
          </Button>
        </EmptyState>
      ) : filteredOffres.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun résultat"
          description={`Aucune offre ne correspond à "${searchTerm}"`}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffres.map((offre) => (
            <RecruiterJobCard
              key={offre.id}
              offre={offre}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation (Premium Dialog) */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden p-0 border-none">
          <div className="bg-destructive/10 p-6 flex flex-col items-center text-center">
            <div className="bg-destructive/20 p-4 rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold text-destructive">
              Supprimer cette offre ?
            </DialogTitle>
            <DialogDescription className="mt-2 text-muted-foreground font-medium">
              L'offre «{" "}
              <span className="text-foreground font-bold">
                {deleteTarget?.titre}
              </span>{" "}
              » sera définitivement supprimée.
              <br />
              Cette action est irréversible.
            </DialogDescription>
          </div>
          <DialogFooter className="p-6 gap-2 sm:gap-0 bg-white">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl flex-1 hover:bg-muted font-semibold"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl flex-1 font-bold shadow-lg shadow-destructive/20"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Suppression...
                </>
              ) : (
                "Confirmer la suppression"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
