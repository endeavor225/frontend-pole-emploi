import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEntreprise } from "@/hooks/useEntreprises";
import { useOffres } from "@/hooks/useOffres";
import { useAuthStore } from "@/store/authStore";
import { useFavoris, ajouterFavori, supprimerFavori } from "@/hooks/useFavoris";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";

import JobCard from "@/components/features/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Tag,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { formatExternalUrl } from "@/lib/utils";

/* ── URL base pour les assets statiques ── */
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3333/api"
).replace(/\/api$/, "");

import CompanyAvatar from "@/components/shared/CompanyAvatar";
/* ── Ligne d'info ── */
function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary transition-colors"
        title={label}
      >
        {content}
      </a>
    );
  }
  return <div title={label}>{content}</div>;
}

/* ══════════════════════════════════════════
   Composant principal
══════════════════════════════════════════ */
export default function EntrepriseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  /* Données de l'entreprise */
  const { entreprise, isLoading, isError } = useEntreprise(id);

  /* Auth & Favoris */
  const { isAuthenticated } = useAuthStore();
  const { favoris, mutate: mutateFavoris } = useFavoris(isAuthenticated);
  const favorisOffreIds = new Set(favoris.map((f) => f.offreId || f.offre?.id));

  /* Offres de l'entreprise — on injecte nomEntreprise et logoPath pour JobCard */
  const offresEntreprise = (entreprise?.offres ?? []).map((o) => ({
    ...o,
    entreprise: {
      ...o.entreprise,
      nomEntreprise: entreprise.nomEntreprise,
      logoPath: entreprise.logoPath,
    },
  }));

  /* Autres offres (autres entreprises) */
  const { offres: toutesLesOffres } = useOffres(id ? { limit: 20 } : {});

  const autresOffres = toutesLesOffres
    .filter((o) => (o.entrepriseId ?? o.entreprise?.id) !== id)
    .slice(0, 4);

  const handleToggleFavori = async (offre) => {
    if (!isAuthenticated) {
      toast.info("Connectez-vous pour ajouter aux favoris");
      return;
    }
    try {
      const existing = favoris.find(
        (f) => (f.offreId || f.offre?.id) === offre.id,
      );
      if (existing) {
        await supprimerFavori(existing.id);
        toast.success("Retiré des favoris");
      } else {
        await ajouterFavori(offre.id);
        toast.success("Ajouté aux favoris");
      }
      mutateFavoris();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Chargement de l'entreprise…" />
      </div>
    );
  }

  /* ── Erreur / introuvable ── */
  if (isError || !entreprise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Building2 className="w-16 h-16 text-muted-foreground opacity-40" />
        <h1 className="text-2xl font-bold">Entreprise introuvable</h1>
        <p className="text-muted-foreground">
          Cette entreprise n'existe pas ou a été supprimée.
        </p>
        <Button asChild variant="outline">
          <Link to="/offres">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Link>
        </Button>
      </div>
    );
  }

  const nom = entreprise.nomEntreprise || "Entreprise";
  const domaines = entreprise.domaines || [];
  const secteur = entreprise.secteurActivite?.libelle ?? null;

  return (
    <div className="min-h-screen bg-muted/10 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 ">
        {/* BOUTON RETOUR */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1.5 -ml-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>

        {/* HEADER PROFIL SANS BANNIÈRE */}
        <Card className="mb-8 border-border/50 shadow-sm rounded-2xl overflow-hidden bg-card">
          <div className="p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            {/* AVATAR */}
            <div className="shrink-0">
              <CompanyAvatar
                name={nom}
                logoPath={entreprise.logoPath}
                size={120}
              />
            </div>

            {/* TITRE ET BADGES */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                {nom}
              </h1>

              <div className="flex flex-wrap items-center gap-2">
                {domaines.map((dom) => (
                  <Badge
                    key={dom.id}
                    variant="secondary"
                    className="px-3 py-1 font-medium bg-primary/10 text-primary border-0"
                  >
                    <Tag className="w-3.5 h-3.5 mr-1.5" />
                    {dom.libelle}
                  </Badge>
                ))}
                {secteur && (
                  <Badge
                    variant="outline"
                    className="px-3 py-1 font-medium bg-muted text-muted-foreground border-border"
                  >
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                    {secteur}
                  </Badge>
                )}
              </div>
            </div>

            {/* BOUTON D'ACTION (Optionnel) */}
            {entreprise.siteWeb && (
              <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                <Button
                  asChild
                  variant="outline"
                  className="w-full md:w-auto rounded-xl"
                >
                  <a
                    href={formatExternalUrl(entreprise.siteWeb)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visiter le site
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* ── GRILLE DE CONTENU (ABOUT + SIDEBAR) ── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-8 lg:space-y-0">
          {/* COLONNE GAUCHE (Main Content) */}
          <div className="lg:col-span-8 space-y-8">
            {/* SECTION: À PROPOS */}
            {entreprise.description && (
              <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl py-0">
                <div className="bg-muted/30 px-6 py-4 border-b border-border/40 flex items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />À propos
                  </h2>
                </div>
                <CardContent className="p-4">
                  <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {entreprise.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SECTION: OFFRES DE L'ENTREPRISE */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-primary" />
                  Offres de {nom}
                  {offresEntreprise.length > 0 && (
                    <Badge variant="secondary" className="ml-2 font-semibold">
                      {offresEntreprise.length}
                    </Badge>
                  )}
                </h2>
              </div>

              {offresEntreprise.length > 0 ? (
                <div className="space-y-4">
                  {offresEntreprise.map((offre) => (
                    <JobCard
                      key={offre.id}
                      offre={offre}
                      isFavori={favorisOffreIds.has(offre.id)}
                      onToggleFavori={handleToggleFavori}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="Aucune offre active"
                  description="Cette entreprise n'a pas publié d'offres pour le moment."
                />
              )}
            </section>

            {/* SECTION: AUTRES OFFRES (Autres entreprises) */}
            {autresOffres.length > 0 && (
              <section className="pt-10 border-t border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Tag className="w-6 h-6 text-primary" />
                    Autres opportunités
                  </h2>
                </div>

                <div className="space-y-4">
                  {autresOffres.map((offre) => (
                    <JobCard
                      key={offre.id}
                      offre={offre}
                      isFavori={favorisOffreIds.has(offre.id)}
                      onToggleFavori={handleToggleFavori}
                    />
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Button asChild variant="outline" className="rounded-xl px-8">
                    <Link to="/offres">
                      Voir toutes les offres
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            )}

            {!isAuthenticated && (
              <div className="mt-8 text-center px-6 py-10 bg-primary/5 rounded-3xl border border-primary/10">
                <h3 className="text-lg font-bold mb-2">
                  Vous voulez voir plus d'offres ?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Créez un compte gratuitement pour accéder à des milliers
                  d'opportunités et postuler en un clic.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild size="lg" className="rounded-xl">
                    <Link to="/register">S'inscrire gratuitement</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-xl"
                  >
                    <Link to="/login">Se connecter</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* COLONNE DROITE (Sidebar Infos) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden py-0">
              <div className="bg-primary px-6 py-4 text-primary-foreground">
                <h3 className="font-semibold flex items-center gap-2">
                  Contact & Infos
                </h3>
              </div>
              <CardContent className="p-6 space-y-5">
                {entreprise.user && (
                  <InfoRow
                    icon={User}
                    label="Contact recruteur"
                    value={[
                      entreprise.civilite,
                      entreprise.user.prenom,
                      entreprise.user.nom,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}
                {(entreprise.adresse ||
                  entreprise.ville ||
                  entreprise.pays) && (
                  <InfoRow
                    icon={MapPin}
                    label="Localisation"
                    value={[
                      entreprise.adresse,
                      entreprise.codePostal,
                      entreprise.ville,
                      entreprise.pays,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                )}
                {entreprise.telephone && (
                  <InfoRow
                    icon={Phone}
                    label="Téléphone"
                    value={entreprise.telephone}
                    href={`tel:${entreprise.telephone}`}
                  />
                )}
                {entreprise.user?.email && (
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={entreprise.user.email}
                    href={`mailto:${entreprise.user.email}`}
                  />
                )}
                {entreprise.siteWeb && (
                  <InfoRow
                    icon={Globe}
                    label="Site web"
                    value={entreprise.siteWeb.replace(/^https?:\/\//, "")}
                    href={formatExternalUrl(entreprise.siteWeb)}
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
