import { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useOffre } from "@/hooks/useOffres";
import { useAuthStore } from "@/store/authStore";
import { useFavoris, ajouterFavori, supprimerFavori } from "@/hooks/useFavoris";
import { postuler } from "@/hooks/useCandidatures";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Building2,
  Briefcase,
  GraduationCap,
  Calendar,
  Heart,
  Send,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Star,
  Tag,
  CalendarX,
  Clock,
  Banknote,
  ChevronRight,
  Phone,
  Globe,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { ROLES, TYPE_OFFRE_COLORS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

/* ── Constantes ── */
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3333/api"
).replace(/\/api$/, "");

/* ── Badge coloré selon le type d'offre ── */
function TypeOfreBadge({ type }) {
  const colors = TYPE_OFFRE_COLORS[type] ?? {
    bg: "#F3F4F6",
    text: "#374151",
    border: "#E5E7EB",
  };
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {type}
    </span>
  );
}

import CompanyAvatar from "@/components/shared/CompanyAvatar";

/* ── Ligne d'info réutilisable ── */
function InfoRow({ icon: Icon, label, value, className = "" }) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function OffreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  /* Données passées via state du Link (affichées instantanément) */
  const initialOffre = location.state?.offre ?? null;

  /* Fetch API — les données frîches remplacent initialOffre une fois disponibles */
  const { offre: fetchedOffre, isLoading, isError } = useOffre(id);

  /* On utilise les données fraîches si disponibles, sinon le snapshot de navigation */
  const offre = fetchedOffre ?? initialOffre;

  const { user, isAuthenticated } = useAuthStore();
  const isCandidat = user?.role === ROLES.CANDIDAT;
  const { favoris, mutate: mutateFavoris } = useFavoris(
    isAuthenticated && isCandidat,
  );

  const [postulerLoading, setPostulerLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isFavori = favoris.some((f) => (f.offreId || f.offre?.id) === id);

  const handlePostuler = async () => {
    setPostulerLoading(true);
    try {
      await postuler(id);
      toast.success("Candidature envoyée avec succès !");
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la candidature",
      );
    } finally {
      setPostulerLoading(false);
    }
  };

  const handleToggleFavori = async () => {
    if (!isAuthenticated) {
      toast.info("Connectez-vous pour ajouter aux favoris");
      return;
    }
    if (!isCandidat) {
      toast.info("Seuls les candidats peuvent ajouter aux favoris");
      return;
    }
    try {
      const existing = favoris.find((f) => (f.offreId || f.offre?.id) === id);
      if (existing) {
        await supprimerFavori(existing.id);
        toast.success("Retiré des favoris");
      } else {
        await ajouterFavori(id);
        toast.success("Ajouté aux favoris");
      }
      mutateFavoris();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  /* ── États de chargement / erreur ── */
  /* Spinner uniquement si on n'a pas de snapshot de navigation et que la requête est en cours */
  if (isLoading && !offre)
    return <LoadingSpinner text="Chargement de l'offre…" />;

  if (isError || !offre) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Offre introuvable
        </h2>
        <p className="text-muted-foreground mb-6">
          Cette offre n'existe pas ou a été supprimée.
        </p>
        <Button asChild>
          <Link to="/offres">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux offres
          </Link>
        </Button>
      </div>
    );
  }

  const entreprise = offre.entreprise || {};
  const salMin = offre.salaireMin ?? offre.salaire_min;
  const salMax = offre.salaireMax ?? offre.salaire_max;
  const hasSalary = salMin != null || salMax != null;

  const salaryLabel = hasSalary
    ? salMin && salMax
      ? `${Number(salMin).toLocaleString("fr-FR")} – ${Number(salMax).toLocaleString("fr-FR")} XOF`
      : `À partir de ${Number(salMin ?? salMax).toLocaleString("fr-FR")} XOF`
    : null;

  const dateLimite = offre.dateLimite
    ? new Date(offre.dateLimite).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;
  const isExpired = offre.dateLimite
    ? new Date(offre.dateLimite) < new Date()
    : false;

  return (
    <div className="min-h-screen">
      {/* ── Breadcrumb / Back ── */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <Link to="/offres" className="hover:text-primary transition-colors">
            Offres d'emploi
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate max-w-xs">
            {offre.titre}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1.5 -ml-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ════════════════════════════
              Colonne principale
          ════════════════════════════ */}
          <div className="lg:col-span-2 space-y-5">
            {/* ── Hero card ── */}
            <Card className="bg-(--cream)/10 border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {offre.entreprise?.id ? (
                    <Link
                      to={`/entreprises/${offre.entreprise.id}`}
                      className="shrink-0 hover:opacity-80 transition-opacity mx-auto sm:mx-0"
                    >
                      <CompanyAvatar
                        name={entreprise.nomEntreprise || "?"}
                        logoPath={entreprise.logoPath}
                        size={152}
                      />
                    </Link>
                  ) : (
                    <div className="mx-auto sm:mx-0 shrink-0">
                      <CompanyAvatar
                        name={entreprise.nomEntreprise || "?"}
                        logoPath={entreprise.logoPath}
                        size={152}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {offre.typeOffre && (
                        <TypeOfreBadge type={offre.typeOffre} />
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/30">
                          <CalendarX className="w-3 h-3" /> Expirée
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">
                      {offre.titre}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {entreprise.nomEntreprise && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {offre.entreprise?.id ? (
                            <Link
                              to={`/entreprises/${offre.entreprise.id}`}
                              className="font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                              {entreprise.nomEntreprise}
                            </Link>
                          ) : (
                            <span className="font-medium text-muted-foreground">
                              {entreprise.nomEntreprise}
                            </span>
                          )}
                        </span>
                      )}
                      {offre.localisation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {offre.localisation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(offre.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Méta-infos rapides */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
                  {offre.experienceMin != null && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" /> Expérience
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {offre.experienceMin} an
                        {offre.experienceMin > 1 ? "s" : ""} min.
                      </span>
                    </div>
                  )}
                  {salaryLabel && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Banknote className="w-3 h-3 text-green-500" /> Salaire
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {salaryLabel}
                      </span>
                    </div>
                  )}
                  {dateLimite && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-600" /> Date
                        limite
                      </span>
                      <span
                        className={`text-sm font-semibold ${isExpired ? "text-destructive font-semibold" : "text-foreground"}`}
                      >
                        {dateLimite}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Description ── */}
            <Card className="bg-(--cream)/10">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Description du poste
                </h2>
                <div
                  className="text-sm text-muted-foreground leading-relaxed tiptap-content"
                  dangerouslySetInnerHTML={{ __html: offre.description }}
                />
              </CardContent>
            </Card>

            {/* ── Compétences & niveaux ── */}
            {(offre.domaines?.length > 0 || offre.niveauxEtude?.length > 0) && (
              <Card className="bg-(--cream)/10">
                <CardContent className="p-6 space-y-5">
                  {offre.domaines?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" /> Domaines
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {offre.domaines.map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-border bg-muted/40 text-muted-foreground"
                          >
                            {d.libelle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {offre.niveauxEtude?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />{" "}
                        Niveaux d'étude requis
                      </h3>
                      <div className="flex flex-wrap gap-2 ">
                        {offre.niveauxEtude
                          .sort((a, b) =>
                            b.createdAt.localeCompare(a.createdAt),
                          )
                          .map((n) => (
                            <span
                              key={n.id}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-secondary/3 bg-secondary/10 text-secondary font-medium"
                            >
                              <GraduationCap className="w-3 h-3" /> {n.libelle}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ════════════════════════════
              Sidebar droite
          ════════════════════════════ */}
          <div className="space-y-4">
            {/* ── Actions ── */}
            <Card className="bg-(--cream)/10">
              <CardContent className="p-5 space-y-3">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  Actions
                </p>

                {isCandidat && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full gap-2"
                        size="lg"
                        disabled={isExpired}
                      >
                        <Send className="w-4 h-4" />
                        {isExpired ? "Offre expirée" : "Postuler"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer votre candidature</DialogTitle>
                        <DialogDescription>
                          Vous allez postuler à l'offre{" "}
                          <strong>« {offre.titre} »</strong>. Le recruteur sera
                          notifié.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          onClick={handlePostuler}
                          disabled={postulerLoading}
                        >
                          {postulerLoading ? (
                            <>
                              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                              Envoi…
                            </>
                          ) : (
                            "Confirmer"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleToggleFavori}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isFavori ? "fill-destructive text-destructive" : ""}`}
                    />
                    {isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </Button>
                )}

                {isAuthenticated && entreprise.userId && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to={`/messages/${entreprise.userId}`}>
                      <MessageSquare className="w-4 h-4" /> Contacter le
                      recruteur
                    </Link>
                  </Button>
                )}

                {!isAuthenticated && (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Connectez-vous pour postuler ou ajouter aux favoris.
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/login" state={{ from: location.pathname }}>
                        Se connecter
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Entreprise ── */}
            {entreprise.nomEntreprise && (
              <Card className="bg-(--cream)/10">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-4">
                    À propos de l'entreprise
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <CompanyAvatar
                      name={entreprise.nomEntreprise}
                      logoPath={entreprise.logoPath}
                      size={44}
                    />
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        {entreprise.nomEntreprise}
                      </p>
                      {entreprise.ville && (
                        <p className="text-[13px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {entreprise.ville}
                          {entreprise.pays ? `, ${entreprise.pays}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-border pt-3">
                    {entreprise.adresse && (
                      <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {entreprise.adresse}
                        {entreprise.codePostal
                          ? ` — ${entreprise.codePostal}`
                          : ""}
                      </p>
                    )}
                    {entreprise.telephone && (
                      <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3 shrink-0" />
                        <a
                          href={`tel:${entreprise.telephone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {entreprise.telephone}
                        </a>
                      </p>
                    )}
                    {entreprise.siteWeb && (
                      <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                        <Globe className="w-3 h-3 shrink-0" />
                        <a
                          href={
                            entreprise.siteWeb.startsWith("http")
                              ? entreprise.siteWeb
                              : `https://${entreprise.siteWeb}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors truncate"
                        >
                          {entreprise.siteWeb}
                        </a>
                      </p>
                    )}
                    {entreprise.description && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-4 pt-1">
                        {entreprise.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Infos complémentaires ── */}
            <Card className="bg-(--cream)/10">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  Détails
                </p>
                <InfoRow
                  icon={Calendar}
                  label="Publiée le"
                  value={new Date(offre.createdAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  icon={MapPin}
                  label="Localisation"
                  value={offre.localisation}
                />
                <InfoRow
                  icon={Star}
                  label="Expérience requise"
                  value={
                    offre.experienceMin != null
                      ? `${offre.experienceMin} an${offre.experienceMin > 1 ? "s" : ""} minimum`
                      : null
                  }
                />
                <InfoRow icon={Banknote} label="Salaire" value={salaryLabel} />
                {dateLimite && (
                  <InfoRow
                    icon={CalendarX}
                    label="Date limite"
                    value={dateLimite}
                    className={isExpired ? "text-destructive" : ""}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
