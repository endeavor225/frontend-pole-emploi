import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOffre, updateOffre } from "@/hooks/useOffres";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { TYPES_OFFRE } from "@/lib/constants";
import { toast } from "sonner";

export default function ModifierOffrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { offre, isLoading: offreLoading } = useOffre(id);
  const [loading, setLoading] = useState(false);

  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);
  const domaines = domainesData?.data || domainesData || [];
  const niveaux = niveauxData?.data || niveauxData || [];

  const [form, setForm] = useState({
    titre: "",
    description: "",
    typeOffre: "",
    localisation: "",
    dateExpiration: "",
    domaineIds: [],
    niveauEtudeIds: [],
  });

  // Populate form when offre loads
  useEffect(() => {
    if (offre) {
      setForm({
        titre: offre.titre || "",
        description: offre.description || "",
        typeOffre: offre.typeOffre || "",
        localisation: offre.localisation || "",
        dateExpiration: offre.dateExpiration?.split("T")[0] || "",
        domaineIds: offre.domaines?.map((d) => d.id) || [],
        niveauEtudeIds: offre.niveauEtudes?.map((n) => n.id) || [],
      });
    }
  }, [offre]);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });
  const updateSelect = (field) => (value) =>
    setForm({ ...form, [field]: value });

  const toggleArrayItem = (field, itemId) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(itemId)
        ? prev[field].filter((x) => x !== itemId)
        : [...prev[field], itemId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateOffre(id, form);
      toast.success("Offre modifiée avec succès !");
      navigate("/recruteur/offres");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setLoading(false);
    }
  };

  if (offreLoading) return <LoadingSpinner text="Chargement de l'offre…" />;

  return (
    <div className="max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Modifier l'offre</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de l'offre *</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={update("titre")}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={update("description")}
                required
                disabled={loading}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type d'offre</Label>
                <Select
                  value={form.typeOffre}
                  onValueChange={updateSelect("typeOffre")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_OFFRE.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation</Label>
                <Input
                  id="localisation"
                  value={form.localisation}
                  onChange={update("localisation")}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateExpiration">Date d'expiration</Label>
              <Input
                id="dateExpiration"
                type="date"
                value={form.dateExpiration}
                onChange={update("dateExpiration")}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Domaines d'activité</Label>
              <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto">
                {domaines.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleArrayItem("domaineIds", d.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${form.domaineIds.includes(d.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    {d.libelle}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Niveaux d'étude requis</Label>
              <div className="flex flex-wrap gap-2 rounded-lg border p-3">
                {niveaux.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleArrayItem("niveauEtudeIds", n.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${form.niveauEtudeIds.includes(n.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    {n.libelle}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Enregistrement…
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
