import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useOffres } from "@/hooks/useOffres";
import { useDomaines } from "@/hooks/useDomaines";
import { useAuthStore } from "@/store/authStore";
import { useFavoris, ajouterFavori, supprimerFavori } from "@/hooks/useFavoris";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckboxGroup } from "@/components/shared/CheckboxGroup";
import JobCard from "@/components/features/JobCard";
import { TYPES_OFFRE, SORT_OPTIONS, ROLES } from "@/lib/constants";
import { toast } from "sonner";

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
import { AppPagination } from "@/components/shared/Pagination";

// Icônes
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  X,
  Tag,
} from "lucide-react";

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

  /* Liste des domaines disponibles */
  const { domaines } = useDomaines();

  /* État local de la barre de recherche */
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [locInput, setLocInput] = useState(
    searchParams.get("localisation") || "",
  );
  const [searchTypeInput, setSearchTypeInput] = useState(() => {
    const raw = searchParams.get("typeOffre");
    return raw ? raw.split(",").filter(Boolean) : [];
  });

  /* état des filtres sidebar */
  const [sortBy, setSortBy] = useState("recent");

  // Local state for the CheckboxGroup (client-side filtering)
  const [selectedTypesLocal, setSelectedTypesLocal] = useState([]);

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

  const [salRange, setSalRange] = useState(() => {
    const min = searchParams.get("salaire_min");
    const max = searchParams.get("salaire_max");
    return [
      min ? Number(min) : SAL_MIN_DEFAULT,
      max ? Number(max) : SAL_MAX_DEFAULT,
    ];
  });

  /* Filtres envoyés à l'API — domaine_id vient de l'état local (pas de l'URL au chargement) */
  const filters = {
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 10,
    search: searchParams.get("search") || "",
    localisation: searchParams.get("localisation") || "",
    typeOffre: searchParams.get("typeOffre") || "",
    ...(selectedDomaines.length > 0 && {
      domaine_id: selectedDomaines.join(","),
    }),
    ...(salRange[0] > SAL_MIN_DEFAULT && { salaire_min: salRange[0] }),
    ...(salRange[1] < SAL_MAX_DEFAULT && { salaire_max: salRange[1] }),
    all: "true",
  };

  const { offres, meta, isLoading, isValidating } = useOffres(filters);

  const isCandidat = user?.role === ROLES.CANDIDAT;
  const { favoris, mutate: mutateFavoris } = useFavoris(
    isAuthenticated && isCandidat,
  );

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

    /* Synchronise les types sélectionnées dans l'URL (Select dans la search bar) */
    if (searchTypeInput.length > 0)
      params.set("typeOffre", searchTypeInput.join(","));
    else params.delete("typeOffre");

    params.set("page", "1");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ all: "true" });
    setSearchInput("");
    setLocInput("");
    setSearchTypeInput([]);
    setSelectedTypesLocal([]);
    setSelectedDomaines([]);
    setSalRange([SAL_MIN_DEFAULT, SAL_MAX_DEFAULT]);
    setSortBy("recent");
  };

  // Local filtering (CheckboxGroup)
  const toggleTypeLocal = (val) => {
    setSelectedTypesLocal((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

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

  const handleSortChange = (val) => {
    setSortBy(val);
  };

  const handleSalRangeChange = (val) => {
    setSalRange(val);
  };

  const handleSalRangeCommit = (val) => {
    setSearchParams((p) => {
      const params = new URLSearchParams(p);
      if (val[0] > SAL_MIN_DEFAULT)
        params.set("salaire_min", val[0].toString());
      else params.delete("salaire_min");

      if (val[1] < SAL_MAX_DEFAULT)
        params.set("salaire_max", val[1].toString());
      else params.delete("salaire_max");

      params.set("page", "1");
      return params;
    });
  };

  const handleToggleFavori = async (offre) => {
    if (!isAuthenticated) {
      toast.info("Connectez-vous pour ajouter aux favoris");
      return;
    }
    if (!isCandidat) {
      toast.info("Seuls les candidats peuvent ajouter aux favoris");
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
  const processedOffres = [...offres]
    .filter((o) => {
      /* Filtre type d'offre local (CheckboxGroup) */
      if (
        selectedTypesLocal.length > 0 &&
        !selectedTypesLocal.includes(o.typeOffre)
      )
        return false;
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
    filters.typeOffre ||
    filters.domaine_id ||
    filters.salaire_min ||
    filters.salaire_max;
  //selectedTypesLocal.length > 0;

  /* Formatage de l'étiquette de salaire en FCFA */
  const fmtSal = (v) => Number(v).toLocaleString("fr-FR");

  /* ── Barre latérale (filtres) ─────────────────── */
  const SidebarContent = (
    <div className="space-y-4">
      {/* Sort card */}
      <Card className="bg-(--cream)/40">
        <CardContent className="p-4 space-y-5">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Trier par
            </span>
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
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

          <div className="border-t border-border" />

          {/* Type emploi */}
          <CheckboxGroup
            label="Type d'emploi"
            options={TYPES_OFFRE}
            selected={selectedTypesLocal}
            onToggle={toggleTypeLocal}
          />
        </CardContent>
      </Card>

      {/* Filters card */}
      <Card className="bg-(--cream)/40">
        <CardContent className="p-4 space-y-5">
          {/* Domaines */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Domaines de compétences
            </p>
            <div className="space-y-2.5 max-h-708 overflow-y-auto pr-1">
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
          {/* <div>
            <p className="text-sm font-semibold text-foreground mb-4">
              Fourchette de salaire
            </p>
            <Slider
              min={SAL_MIN_DEFAULT}
              max={SAL_MAX_DEFAULT}
              step={5000}
              value={salRange}
              onValueChange={handleSalRangeChange}
              onValueCommit={handleSalRangeCommit}
              className="**:[[role=slider]]:bg-primary **:[[role=slider]]:border-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0 FCFA</span>
              <span>2 000 000 FCFA</span>
            </div>
            <p className="text-center text-sm font-semibold text-primary mt-1">
              {fmtSal(salRange[0])} – {fmtSal(salRange[1])} FCFA
            </p>
          </div> */}
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
                  onChange={(e) => setSearchInput(e.target.value.trim())}
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
                  onChange={(e) => setLocInput(e.target.value.trim())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 bg-background border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              {/* Type d'offre */}
              <div className="relative flex-1 sm:max-w-[200px]">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Select
                  value={
                    searchTypeInput.length === 1
                      ? searchTypeInput[0]
                      : searchTypeInput.length === 0
                        ? "all"
                        : "multiple"
                  }
                  onValueChange={(val) => {
                    if (val === "all") setSearchTypeInput([]);
                    else if (val !== "multiple") setSearchTypeInput([val]);
                  }}
                >
                  <SelectTrigger className="w-full pl-9 bg-background border-0 focus:ring-1 focus:ring-primary shadow-none">
                    <SelectValue placeholder="Type d'offre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {TYPES_OFFRE.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                    {searchTypeInput.length > 1 && (
                      <SelectItem value="multiple" disabled>
                        Plusieurs types
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="shrink-0 px-6">
                Trouver un emploi
              </Button>
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
                Reinitialiser la recherche
              </Button>
            )}
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
              <p className="text-lg md:text-2xl text-muted-foreground">
                {isValidating ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="font-semibold text-foreground">
                      {meta.total}
                    </span>{" "}
                    offre{meta.total > 1 ? "s" : ""} disponible
                    {meta.total > 1 ? "s" : ""}
                    {/* <span className="ml-1 h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" /> */}
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
              {(() => {
                // Obtenez les types actifs depuis l'URL (qui ont été appliqués via onSubmit)
                const activeUrlTypes = filters.typeOffre
                  ? filters.typeOffre.split(",")
                  : [];

                return activeUrlTypes.map((typeVal) => (
                  <button
                    key={`tag-type-${typeVal}`}
                    onClick={() => {
                      // Supprime de l'état local du champ de recherche
                      setSearchTypeInput((prev) =>
                        prev.filter((v) => v !== typeVal),
                      );
                      // Met à jour l'URL pour appliquer la suppression
                      setSearchParams((p) => {
                        const params = new URLSearchParams(p);
                        const next = activeUrlTypes.filter(
                          (v) => v !== typeVal,
                        );
                        if (next.length > 0)
                          params.set("typeOffre", next.join(","));
                        else params.delete("typeOffre");
                        params.set("page", "1");
                        return params;
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Briefcase className="w-3 h-3" />
                    {TYPES_OFFRE.find((t) => t.value === typeVal)?.label ||
                      typeVal}
                    <X className="w-3 h-3 opacity-60 hover:opacity-100" />
                  </button>
                ));
              })()}
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
                <AppPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilter("page", String(page))}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
