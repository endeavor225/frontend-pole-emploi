import { useState } from "react";
import { Link } from "react-router-dom";
import { useOffres, deleteOffre } from "@/hooks/useOffres";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Pencil,
  Trash2,
  Users,
  Briefcase,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function MesOffresPage() {
  const { offres, isLoading, mutate } = useOffres();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOffre(deleteTarget.id);
      toast.success("Offre supprimée");
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes offres</h1>
          <p className="mt-1 text-muted-foreground">
            {offres.length} offre{offres.length > 1 ? "s" : ""} publiée
            {offres.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link to="/recruteur/offres/nouvelle">
            <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle offre
          </Link>
        </Button>
      </div>

      {offres.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune offre publiée"
          description="Publiez votre première offre pour commencer à recevoir des candidatures."
        >
          <Button asChild>
            <Link to="/recruteur/offres/nouvelle">
              <PlusCircle className="mr-2 h-4 w-4" /> Créer une offre
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead className="text-center">Candidatures</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offres.map((offre) => (
                <TableRow key={offre.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <Link
                      to={`/offres/${offre.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {offre.titre}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {offre.typeOffre && (
                      <Badge variant="secondary">{offre.typeOffre}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {offre.localisation || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {offre.candidaturesCount ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {offre.createdAt
                      ? new Date(offre.createdAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        title="Candidatures"
                      >
                        <Link to={`/recruteur/offres/${offre.id}/candidatures`}>
                          <Users className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        title="Modifier"
                      >
                        <Link to={`/recruteur/offres/${offre.id}/modifier`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(offre)}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette offre ?</DialogTitle>
            <DialogDescription>
              L'offre « {deleteTarget?.titre} » sera définitivement supprimée.
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression…
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
