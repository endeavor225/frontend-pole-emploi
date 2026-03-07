import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MapPin,
  Clock,
  ChevronDown,
  GraduationCap,
  Tag,
  CalendarX,
  Star,
  Building2,
  Bookmark,
} from "lucide-react";

import { timeAgo } from "@/lib/utils";
import { TYPE_OFFRE_COLORS } from "@/lib/constants";

/* URL de base du serveur pour les assets statiques */
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3333/api"
).replace(/\/api$/, "");

/* Avatar de l'entreprise — logo réel si disponible, sinon initiales */
function CompanyAvatar({ name = "", logoPath = null }) {
  const [imgError, setImgError] = useState(false);

  // Palette de couleurs dérivée du premier caractère du nom
  const palettes = [
    { bg: "#FEE2E2", fg: "#991B1B" },
    { bg: "#D1FAE5", fg: "#065F46" },
    { bg: "#DBEAFE", fg: "#1E40AF" },
    { bg: "#FEF3C7", fg: "#92400E" },
    { bg: "#EDE9FE", fg: "#5B21B6" },
    { bg: "#CCFBF1", fg: "#134E4A" },
    { bg: "#FFEDD5", fg: "#9A3412" },
    { bg: "#FCE7F3", fg: "#9D174D" },
  ];
  const idx = (name.charCodeAt(0) || 0) % palettes.length;
  const { bg, fg } = palettes[idx];

  /* URL complète du logo */
  const logoUrl = logoPath && !imgError ? `${API_BASE}${logoPath}` : null;

  if (logoUrl) {
    return (
      <div
        className="shrink-0 rounded-xl overflow-hidden border border-border bg-muted/30"
        style={{ width: 152, height: 152 }}
      >
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const size = 152;
  return (
    <div
      className="flex items-center justify-center rounded-xl font-semibold text-sm select-none shrink-0"
      style={{ backgroundColor: bg, color: fg, width: size, height: size }}
    >
      <Building2
        style={{ width: size * 0.5, height: size * 0.5 }}
        className="text-muted-foreground"
      />
    </div>
  );
}

/* ── Badge coloré selon le type d'offre ─────────────────── */
function TypeOfreBadge({ type }) {
  const colors = TYPE_OFFRE_COLORS[type] ?? {
    bg: "#F3F4F6",
    text: "#374151",
    border: "#E5E7EB",
  };
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border"
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

/* ── Carte d'offre horizontale ───────────────────── */
export default function JobCard({ offre, isFavori, onToggleFavori }) {
  const [expanded, setExpanded] = useState(false);
  const entreprise = offre.entreprise || {};
  const nomEntreprise = entreprise.nomEntreprise || "Entreprise";
  const salMin = offre.salaireMin ?? offre.salaire_min ?? null;
  const salMax = offre.salaireMax ?? offre.salaire_max ?? null;
  const hasSalary = salMin != null || salMax != null;
  const ago = timeAgo(offre.createdAt);

  /* Date limite */
  const dateLimite = offre.dateLimite
    ? new Date(offre.dateLimite).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const isExpired = offre.dateLimite && new Date(offre.dateLimite) < new Date();

  /* Niveaux d'étude */
  const niveaux = offre.niveauxEtude ?? [];

  /* Domaines = compétences */
  const domaines = offre.domaines ?? [];

  return (
    <Card className="group transition-all duration-200 hover:shadow-md hover:border-primary/30 bg-(--cream)/10">
      <CardContent className="p-5">
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4">
          {/* Logo */}
          <CompanyAvatar name={nomEntreprise} logoPath={entreprise.logoPath} />

          {/* Body */}
          <div className="flex-1 min-w-0">
            {/* Ligne 1 : Titre + Favori */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-[15px] md:text-[18px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/offres/${offre.id}`} className="hover:underline">
                    {offre.titre}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {nomEntreprise}
                </p>
              </div>

              {/* Favori */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavori?.(offre);
                }}
                className="shrink-0 p-1.5 rounded-full hover:bg-destructive/10 transition-colors cursor-pointer"
                aria-label={
                  isFavori ? "Retirer des favoris" : "Ajouter aux favoris"
                }
              >
                <Bookmark
                  className={`w-5 h-5 transition-colors ${
                    isFavori
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  }`}
                />
              </button>
            </div>

            {/* Ligne 2 : Localisation | Date publication | Type offre */}
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              {offre.localisation && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                  {offre.localisation}
                </span>
              )}
              {ago && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 text-primary shrink-0" />
                  {ago}
                </span>
              )}
              {offre.typeOffre && <TypeOfreBadge type={offre.typeOffre} />}
            </div>

            {/* Ligne 3 : Expérience | Niveaux d'étude | Date limite */}
            <div className="flex flex-wrap items-center gap-2.5 mt-2">
              {/* Expérience minimale */}
              {offre.experienceMin != null && offre.experienceMin > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-primary shrink-0" />
                  {offre.experienceMin} an{offre.experienceMin > 1 ? "s" : ""}{" "}
                  d'exp.
                </span>
              )}
              {/* Niveaux d'étude */}
              {niveaux
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((n) => (
                  <span
                    key={n.id}
                    className="flex items-center gap-1 text-xs bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded-full border border-secondary/20"
                  >
                    <GraduationCap className="w-3 h-3 shrink-0" />
                    {n.libelle}
                  </span>
                ))}
              {/* Date limite */}
              {dateLimite && (
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                    isExpired
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  <CalendarX className="w-3 h-3 shrink-0" />
                  Limite : {dateLimite}
                </span>
              )}
            </div>

            {/* Ligne 4 : Domaines / compétences */}
            {domaines.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {domaines.map((d) => (
                  <span
                    key={d.id}
                    className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border"
                  >
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    {d.libelle}
                  </span>
                ))}
              </div>
            )}

            {/* Ligne 5 : Salaire + Bouton Postuler */}
            <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
              <div>
                {hasSalary ? (
                  <>
                    <p className="font-semibold text-foreground text-sm">
                      {salMin && salMax
                        ? `${Number(salMin).toLocaleString("fr-FR")} – ${Number(salMax).toLocaleString("fr-FR")} XOF`
                        : salMin
                          ? `À partir de ${Number(salMin).toLocaleString("fr-FR")} XOF`
                          : `Jusqu'à ${Number(salMax).toLocaleString("fr-FR")} XOF`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Salaire mensuel
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Salaire non précisé
                  </p>
                )}
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link to={`/offres/${offre.id}`} state={{ offre }}>
                  Postuler
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Description dépliable */}
        {offre.description && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 flex items-center justify-center w-full cursor-pointer"
              aria-label="Voir la description"
            >
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {expanded && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4 border-t border-border pt-3 whitespace-pre-wrap">
                {offre.description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
