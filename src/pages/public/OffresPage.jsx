import { useState, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useOffres } from "@/hooks/useOffres";
import { useDomaines } from "@/hooks/useDomaines";
import { useAuthStore } from "@/store/authStore";
import { useFavoris, ajouterFavori, supprimerFavori } from "@/hooks/useFavoris";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { TYPES_OFFRE, TYPE_OFFRE_COLORS, SORT_OPTIONS } from "@/lib/constants";

// Composants shadcn
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Icônes
import {
  Search,
  MapPin,
  Briefcase,
  Heart,
  Clock,
  ChevronDown,
  SlidersHorizontal,
  X,
  GraduationCap,
  Tag,
  CalendarX,
  Star,
  Building2,
} from "lucide-react";

import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";

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

  return (
    <div
      className="flex items-center justify-center rounded-xl font-semibold text-sm select-none shrink-0"
      style={{ backgroundColor: bg, color: fg, width: 152, height: 152 }}
    >
      <Building2
        style={{ width: size * 0.5, height: size * 0.5 }}
        className="text-muted-foreground"
      />
    </div>
  );
}

/* ── Groupe de filtres à cocher ─────────────────── */
function CheckboxGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-2.5">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <Checkbox
              id={`chk-${opt.value}`}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => onToggle(opt.value)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary bg-background"
            />
            <Label
              htmlFor={`chk-${opt.value}`}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
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
function JobCard({ offre, isFavori, onToggleFavori }) {
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
                <h3 className="font-semibold text-foreground text-[15px] leading-snug line-clamp-1 group-hover:text-primary transition-colors">
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
                <Heart
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
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4 border-t border-border pt-3">
                {offre.description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* Salaire par défaut */
const SAL_MIN_DEFAULT = 0;
const SAL_MAX_DEFAULT = 2000000;

/* ══════════════════════════════════════════
   Composant principal de la page
══════════════════════════════════════════ */
export default function OffresPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* État local de la barre de recherche */
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [locInput, setLocInput] = useState(
    searchParams.get("localisation") || "",
  );

  /* état des filtres sidebar */
  const [sortBy, setSortBy] = useState("recent");
  const [selectedTypes, setSelectedTypes] = useState([]);
  /* Initialisé depuis l'URL s'il existe, sinon depuis le domaine du candidat connecté (sans toucher l'URL) */
  const user = useAuthStore((s) => s.user);
  const [selectedDomaines, setSelectedDomaines] = useState(() => {
    const raw = searchParams.get("domaine_id");
    if (raw) return raw.split(",").filter(Boolean);
    /* Pré-cochage silencieux du domaine candidat */
    const domaineId =
      user?.candidat?.domaineId ?? user?.candidat?.domaine?.id ?? null;
    return domaineId ? [domaineId] : [];
  });
  const [salRange, setSalRange] = useState([SAL_MIN_DEFAULT, SAL_MAX_DEFAULT]);

  /* Liste des domaines disponibles */
  const { domaines } = useDomaines();

  /* Filtres envoyés à l'API — domaine_id vient de l'état local (pas de l'URL au chargement) */
  const filters = {
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 10,
    search: searchParams.get("search") || "",
    localisation: searchParams.get("localisation") || "",
    ...(selectedDomaines.length > 0 && {
      domaine_id: selectedDomaines.join(","),
    }),
    all: "true",
  };

  const { offres, meta, isLoading, isValidating } = useOffres(filters);

  const { favoris, mutate: mutateFavoris } = isAuthenticated
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useFavoris()
    : { favoris: [], mutate: () => {} };

  const favorisOffreIds = new Set(favoris.map((f) => f.offreId || f.offre?.id));

  /* Fonction pour modifier un paramètre dans l'URL */
  const setFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.set("page", "1");
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    if (locInput) params.set("localisation", locInput);
    else params.delete("localisation");
    /* Synchronise les domaines sélectionnés dans l'URL */
    if (selectedDomaines.length > 0)
      params.set("domaine_id", selectedDomaines.join(","));
    else params.delete("domaine_id");
    params.set("page", "1");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ all: "true" });
    setSearchInput("");
    setLocInput("");
    setSelectedTypes([]);
    setSelectedDomaines([]);
    setSalRange([SAL_MIN_DEFAULT, SAL_MAX_DEFAULT]);
  };

  const toggleType = (val) =>
    setSelectedTypes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  /* toggleDomaine : met à jour l'état ET l'URL (interaction manuelle) */
  const toggleDomaine = (val) => {
    /* Calcule le prochain état sans l'imbriquer dans un updater */
    const next = selectedDomaines.includes(val)
      ? selectedDomaines.filter((v) => v !== val)
      : [...selectedDomaines, val];
    setSelectedDomaines(next);
    /* Met à jour l'URL séparément */
    setSearchParams((p) => {
      const params = new URLSearchParams(p);
      if (next.length > 0) params.set("domaine_id", next.join(","));
      else params.delete("domaine_id");
      params.set("page", "1");
      return params;
    });
  };

  const handleToggleFavori = async (offre) => {
    if (!isAuthenticated) {
      toast.info("Connectez-vous pour ajouter aux favoris");
      return;
    }
    try {
      const existingFavori = favoris.find(
        (f) => (f.offreId || f.offre?.id) === offre.id,
      );
      if (existingFavori) {
        await supprimerFavori(existingFavori.id);
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

  /* Pagination */
  const totalPages = meta.lastPage || 1;
  const currentPage = Number(filters.page);

  /* Tri, filtrage par type, domaine et salaire côté client */
  const [salMin, salMax] = salRange;
  const processedOffres = [...offres]
    .filter((o) => {
      /* Filtre type d'offre */
      if (selectedTypes.length > 0 && !selectedTypes.includes(o.typeOffre))
        return false;
      /* Filtre salaire */
      const offreSal = Number(o.salaireMin ?? o.salaire_min ?? 0);
      if (offreSal > 0) {
        if (offreSal < salMin) return false;
        if (salMax < SAL_MAX_DEFAULT && offreSal > salMax) return false;
      }
      return true;
    })
    .sort((a, b) =>
      sortBy === "recent"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt),
    );

  const hasActiveFilters =
    filters.search ||
    filters.localisation ||
    selectedTypes.length > 0 ||
    selectedDomaines.length > 0 ||
    salRange[0] > SAL_MIN_DEFAULT ||
    salRange[1] < SAL_MAX_DEFAULT;

  /* Formatage de l'étiquette de salaire en FCFA */
  const fmtSal = (v) => Number(v).toLocaleString("fr-FR");

  /* ── Barre latérale (filtres) ─────────────────── */
  const SidebarContent = (
    <div className="space-y-4">
      {/* Sort card */}
      <Card className="bg-(--cream)/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Trier par
            </span>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Filters card */}
      <Card className="bg-(--cream)/40">
        <CardContent className="p-4 space-y-5">
          {/* Type emploi */}
          <CheckboxGroup
            label="Type d'emploi"
            options={TYPES_OFFRE}
            selected={selectedTypes}
            onToggle={toggleType}
          />

          <div className="border-t border-border" />

          {/* Domaines */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Domaines
            </p>
            <div className="space-y-2.5 max-h-150 overflow-y-auto pr-1">
              {domaines.map((dom) => (
                <div key={dom.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`chk-dom-${dom.id}`}
                    checked={selectedDomaines.includes(dom.id)}
                    onCheckedChange={() => toggleDomaine(dom.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary bg-background"
                  />
                  <Label
                    htmlFor={`chk-dom-${dom.id}`}
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    {dom.libelle}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Salary range */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-4">
              Fourchette de salaire
            </p>
            <Slider
              min={SAL_MIN_DEFAULT}
              max={SAL_MAX_DEFAULT}
              step={5000}
              value={salRange}
              onValueChange={setSalRange}
              className="**:[[role=slider]]:bg-primary **:[[role=slider]]:border-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0 FCFA</span>
              <span>2 000 000 FCFA</span>
            </div>
            <p className="text-center text-sm font-semibold text-primary mt-1">
              {fmtSal(salRange[0])} – {fmtSal(salRange[1])} FCFA
            </p>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="w-full text-muted-foreground hover:text-primary"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Effacer les filtres
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  /* ── Rendu principal ───────────────────────── */
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-10 px-4 rounded-b-3xl">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-7 animate-in fade-in slide-in-from-bottom-3 duration-500">
            Trouvez votre prochaine opportunité
          </h1>

          {/* Search bar */}
          <Card className="p-3 shadow-md border-primary/20 bg-(--cream)/40 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              {/* Title */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Titre d'emploi, mots-clés…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 bg-background border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              {/* Location */}
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Ville, Pays, ou région"
                  value={locInput}
                  onChange={(e) => setLocInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 bg-background border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button onClick={handleSearch} className="shrink-0 px-6">
                Trouver un emploi
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 pb-12 mt-6 rounded-2xl">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant={mobileFiltersOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {hasActiveFilters && (
              <Badge className="px-1.5 py-0 text-xs ml-1">!</Badge>
            )}
          </Button>

          {mobileFiltersOpen && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {SidebarContent}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-96 shrink-0">{SidebarContent}</div>

          {/* Jobs panel */}
          <div className="flex-1 min-w-0">
            {/* Compteur d'offres + paramètres actifs */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  "⏳ Chargement…"
                ) : isValidating ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="font-semibold text-foreground">
                      {meta.total}
                    </span>{" "}
                    offre{meta.total > 1 ? "s" : ""} disponible
                    {meta.total > 1 ? "s" : ""}
                    <span className="ml-1 h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                  </span>
                ) : meta.total ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {meta.total}
                    </span>{" "}
                    offre{meta.total > 1 ? "s" : ""} disponible
                    {meta.total > 1 ? "s" : ""}
                  </>
                ) : (
                  "Aucune offre"
                )}
              </p>

              {/* Tags des filtres actifs — supprimables un par un */}
              {filters.search && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setFilter("search", "");
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  <Search className="w-3 h-3" />
                  {filters.search}
                  <X className="w-3 h-3 opacity-60 hover:opacity-100" />
                </button>
              )}
              {filters.localisation && (
                <button
                  onClick={() => {
                    setLocInput("");
                    setFilter("localisation", "");
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  {filters.localisation}
                  <X className="w-3 h-3 opacity-60 hover:opacity-100" />
                </button>
              )}
              {selectedDomaines.map((id) => {
                const dom = domaines.find((d) => d.id === id);
                return dom ? (
                  <button
                    key={id}
                    onClick={() => toggleDomaine(id)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {dom.libelle}
                    <X className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </button>
                ) : null;
              })}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-(--cream)/10 p-5 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="flex gap-2 mt-2">
                          <div className="h-5 w-16 bg-muted rounded-full" />
                          <div className="h-5 w-20 bg-muted rounded-full" />
                          <div className="h-5 w-24 bg-muted rounded-full" />
                        </div>
                      </div>
                      <div className="h-8 w-20 bg-muted rounded-lg shrink-0 self-end" />
                    </div>
                  </div>
                ))}
              </div>
            ) : processedOffres.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Aucune offre trouvée"
                description={
                  hasActiveFilters
                    ? "Essayez de modifier vos critères."
                    : "Aucune offre disponible pour le moment."
                }
              >
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-3"
                  >
                    Effacer les filtres
                  </Button>
                )}
              </EmptyState>
            ) : (
              <>
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  {processedOffres.map((offre) => (
                    <JobCard
                      key={offre.id}
                      offre={offre}
                      isFavori={favorisOffreIds.has(offre.id)}
                      onToggleFavori={handleToggleFavori}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setFilter("page", String(currentPage - 1))
                              }
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2)
                              pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() =>
                                    setFilter("page", String(pageNum))
                                  }
                                  isActive={pageNum === currentPage}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          },
                        )}
                        {currentPage < totalPages && (
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setFilter("page", String(currentPage + 1))
                              }
                              className="cursor-pointer"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
