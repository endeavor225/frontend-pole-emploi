import { Link } from "react-router-dom";
import { useFavoris, supprimerFavori } from "@/hooks/useFavoris";
import { OffreCard } from "@/components/cards/OffreCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function MesFavorisPage() {
  const { favoris, isLoading, mutate } = useFavoris();

  const handleRemove = async (offre) => {
    const fav = favoris.find((f) => (f.offreId || f.offre?.id) === offre.id);
    if (!fav) return;
    try {
      await supprimerFavori(fav.id);
      toast.success("Retiré des favoris");
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    }
  };

  if (isLoading) return <LoadingSpinner text="Chargement de vos favoris…" />;

  const offres = favoris.map((f) => f.offre).filter(Boolean);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mes favoris</h1>
        <p className="mt-1 text-muted-foreground">
          {offres.length} offre{offres.length > 1 ? "s" : ""} sauvegardée
          {offres.length > 1 ? "s" : ""}
        </p>
      </div>

      {offres.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aucun favori"
          description="Ajoutez des offres à vos favoris pour les retrouver facilement."
        >
          <Button asChild>
            <Link to="/offres">Parcourir les offres</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offres.map((offre) => (
            <OffreCard
              key={offre.id}
              offre={offre}
              isFavori
              onToggleFavori={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
