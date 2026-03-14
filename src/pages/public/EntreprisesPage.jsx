import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useEntreprisesList } from "@/hooks/useEntreprises";
import { useAuthStore } from "@/store/authStore";
import { EmptyState } from "@/components/shared/EmptyState";
import CompanyListCard from "@/components/features/CompanyListCard";
import { AppPagination } from "@/components/shared/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Building2, X } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function EntreprisesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated); // Keep for potential future use or if other parts of the app rely on it
  const user = useAuthStore((s) => s.user); // Keep for potential future use

  /* Local Search State */
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [locInput, setLocInput] = useState(
    searchParams.get("localisation") || "",
  );

  /* Fetch entreprises */
  const filters = {
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 12, // 12 cards -> 3x4 grid desktop
    search: searchParams.get("search") || "",
    localisation: searchParams.get("localisation") || "",
  };

  const { entreprises, meta, isLoading, isValidating } =
    useEntreprisesList(filters);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);

    if (searchInput) params.set("search", searchInput);
    else params.delete("search");

    if (locInput) params.set("localisation", locInput);
    else params.delete("localisation");

    params.set("page", "1");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchInput("");
    setLocInput("");
    setSearchParams({});
  };

  /* Pagination */
  const totalPages = meta?.lastPage ?? 1;
  const onPageChange = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    setSearchParams(params);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20 flex flex-col">
      {/* ── HERO IMMERSIF ── */}
      <section className="relative overflow-hidden bg-primary/5 pb-10 pt-16 px-4 border-b border-border/50">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <motion.div 
          className="max-w-4xl w-full mx-auto relative z-10 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge
              variant="outline"
              className="mb-4 bg-background/50 backdrop-blur-sm border-primary/20 text-primary"
            >
              Annuaire des recruteurs
            </Badge>
          </motion.div>
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6"
          >
            Découvrez les entreprises <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
              qui recrutent
            </span>
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          >
            Trouvez l'entreprise idéale qui correspond à vos valeurs, votre
            secteur et vos ambitions professionnelles.
          </motion.p>

          {/* BARRE DE RECHERCHE FLOTTANTE (Même design que OffresPage) */}
          <motion.div variants={fadeInUp}>
            <Card className="p-3 shadow-md border-primary/20 bg-(--cream)/40 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                {/* Champ Recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9 bg-background border-0 focus-visible:ring-1 focus-visible:ring-primary h-10 md:h-10"
                    placeholder="Nom de l'entreprise (ex: TechCorp...)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value.trim())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {/* Champ Localisation */}
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9 bg-background border-0 focus-visible:ring-1 focus-visible:ring-primary h-10 md:h-10"
                    placeholder="Ville ou localisation..."
                    value={locInput}
                    onChange={(e) => setLocInput(e.target.value.trim())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {/* Bouton */}
                <Button
                  className="shrink-0 px-6 h-10 md:h-10"
                  onClick={handleSearch}
                >
                  Rechercher
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CONTENU (Grille pleine largeur) ── */}
      <section className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full relative">
        <div className="flex-1 w-full min-w-0 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {meta?.total
                ? `${meta.total} entreprises trouvées`
                : "Aucune entreprise trouvée"}
              {isValidating && !isLoading && (
                <span className="ml-3 text-sm font-normal text-muted-foreground animate-pulse">
                  Mise à jour...
                </span>
              )}
            </h2>

            {(filters.search || filters.localisation) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground w-fit"
              >
                <X className="w-4 h-4 mr-2" />
                Effacer la recherche
              </Button>
            )}
          </div>

          {/* Loading initial */}
          {isLoading && !isValidating ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl border border-border bg-muted/20"
                />
              ))}
            </div>
          ) : entreprises.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Aucune entreprise trouvée"
              description="Essayez de modifier ou d'effacer vos critères de recherche."
              action={
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Effacer la recherche
                </Button>
              }
            />
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {entreprises.map((ent) => (
                  <motion.div key={ent.id} variants={fadeInUp}>
                    <CompanyListCard entreprise={ent} />
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-12 mb-8 border-t border-border/50 pt-8 flex justify-center">
                <AppPagination
                  currentPage={Number(filters.page)}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
