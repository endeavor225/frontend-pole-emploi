import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useOffres } from "@/hooks/useOffres";
import { AppPagination } from "@/components/shared/Pagination";
import { useFavoris, ajouterFavori, supprimerFavori } from "@/hooks/useFavoris";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import JobCard from "@/components/features/JobCard";
import { Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function OffresRecommandeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const domaineId = user?.candidat?.domaineId ?? user?.candidat?.domaine?.id;

  const page = searchParams.get("page") || 1;

  const { offres, meta, isLoading } = useOffres({
    domaine_id: domaineId,
    page: page,
    limit: 10,
  });

  const { favoris, mutate: mutateFavoris } = useFavoris(!!user);
  const favorisOffreIds = new Set(favoris.map((f) => f.offreId || f.offre?.id));

  const handleToggleFavori = async (offre) => {
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

  if (isLoading)
    return <LoadingSpinner text="Chargement de vos recommandations…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Offres pour vous
        </h1>
        <p className="mt-1 text-muted-foreground">
          {user?.candidat?.domaine?.libelle
            ? `Basé sur votre domaine : ${user.candidat.domaine.libelle}`
            : "Offres correspondant à votre profil."}
        </p>
      </div>

      {!domaineId ? (
        <EmptyState
          icon={Sparkles}
          title="Domaine non renseigné"
          description="Veuillez renseigner votre domaine d'activité dans votre profil pour recevoir des recommandations."
        />
      ) : offres.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune recommandation"
          description="Il n'y a pas encore d'offres dans votre domaine d'activité."
        />
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {offres.map((offre) => (
            <JobCard
              key={offre.id}
              offre={offre}
              isFavori={favorisOffreIds.has(offre.id)}
              onToggleFavori={handleToggleFavori}
            />
          ))}

          <AppPagination
            currentPage={Number(page)}
            totalPages={meta.lastPage || 1}
            onPageChange={(p) => {
              const params = new URLSearchParams(searchParams);
              params.set("page", p.toString());
              setSearchParams(params);
            }}
          />
        </div>
      )}
    </div>
  );
}
