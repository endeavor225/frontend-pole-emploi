import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Mail,
  Phone,
  FileText,
  Loader2,
  MessageSquare,
  MapPin,
  BookOpen,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { STATUTS_CANDIDATURE, STATUT_CANDIDATURE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Composant de carte pour afficher une candidature dans la liste du recruteur.
 */
export default function CandidateCard({
  candidature,
  domaines = [],
  niveaux = [],
  onStatusChange,
  isUpdating = false,
  apiBase = "",
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const c = candidature;
  const candidat = c.candidat || {};

  const handleStatusSelect = (v) => {
    setPendingStatus(v);
    setShowConfirm(true);
  };

  const confirmStatusChange = () => {
    onStatusChange(c.id, pendingStatus);
    setShowConfirm(false);
  };

  const getInitials = (user) => {
    if (!user) return "?";
    const prenom = user.user?.prenom || user.prenom || "";
    const nom = user.user?.nom || user.nom || "";
    return `${(prenom || "")[0] || ""}${(nom || "")[0] || ""}`.toUpperCase();
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
    <Card className="group border-none shadow-sm hover:ring-2 hover:ring-primary/20 transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-14 w-14 ring-4 ring-muted group-hover:ring-primary/10 transition-all overflow-hidden bg-muted">
              {candidat.photoPath && (
                <AvatarImage
                  src={`${apiBase}${candidat.photoPath}`}
                  alt={`${candidat.prenom} ${candidat.nom}`}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {getInitials(candidat)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors">
                  {candidat.user?.prenom || candidat.prenom}{" "}
                  {candidat.user?.nom || candidat.nom}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-0",
                    getStatutStyles(c.statut),
                  )}
                >
                  {STATUTS_CANDIDATURE.find((s) => s.value === c.statut)
                    ?.label || c.statut}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary/60" />{" "}
                  {candidat.user?.email || candidat.email}
                </span>
                {candidat.telephone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary/60" />{" "}
                    {candidat.telephone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-primary/60" />{" "}
                  {candidat.experience} ans d'exp.
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary/60" />{" "}
                  {candidat.ville}
                </span>

                {/* Domaine & Niveau */}
                {candidat.domaineId && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary/60" />
                    {domaines.find((d) => d.id === candidat.domaineId)
                      ?.libelle || "Détails non chargés"}
                  </span>
                )}
                {candidat.niveauEtudeId && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary/60" />
                    {niveaux.find((n) => n.id === candidat.niveauEtudeId)
                      ?.libelle || "Niveau non chargé"}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary/60" /> Postulé
                  le {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-muted">
            {(candidat.curriculumVitaePath || candidat.curriculumVitae) && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl flex-1 lg:flex-none h-10 px-4 group/cv"
                asChild
              >
                <a
                  href={`${apiBase}${candidat.curriculumVitaePath || candidat.curriculumVitae}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4 mr-2 text-primary group-hover/cv:scale-110 transition-transform" />{" "}
                  CV
                </a>
              </Button>
            )}

            <div className="relative flex items-center gap-2 flex-1 lg:flex-none">
              <Select
                value={c.statut}
                onValueChange={handleStatusSelect}
                disabled={isUpdating}
              >
                <SelectTrigger
                  size="lg"
                  className="h-10 w-full lg:w-[160px] rounded-xl bg-muted/10 font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {STATUTS_CANDIDATURE.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="rounded-lg my-0.5"
                    >
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isUpdating && (
                <div className="absolute -right-7">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              className="rounded-xl flex-1 lg:flex-none h-10 px-4 hover:opacity-90 shadow-sm"
              asChild
            >
              <Link
                to={`/messages/${candidat.userId}`}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            </Button>
          </div>
        </div>

        {/* Dialog de confirmation */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer le changement</DialogTitle>
              <DialogDescription>
                Voulez-vous vraiment passer le statut de cette candidature à :{" "}
                <span className="font-bold text-foreground">
                  {
                    STATUTS_CANDIDATURE.find((s) => s.value === pendingStatus)
                      ?.label
                  }
                </span>
                ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-1">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Annuler
              </Button>
              <Button onClick={confirmStatusChange}>Confirmer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
