import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { AUTH, CANDIDATS } from "@/api/endpoints";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Save } from "lucide-react";
import { toast } from "sonner";

export default function MonProfilPage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { data: profileData, mutate: mutateProfile } = useSWR(AUTH.ME, fetcher);
  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);

  const domaines = domainesData?.data || domainesData || [];
  const niveaux = niveauxData?.data || niveauxData || [];
  const profile = profileData?.candidat || profileData || {};

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    dateNaissance: "",
    adresse: "",
    ville: "",
    bio: "",
    domaineId: "",
    niveauEtudeId: "",
    photo: null,
    curriculumVitae: null,
  });

  useEffect(() => {
    if (profileData) {
      const p = profileData.candidat || profileData;
      setForm({
        nom: p.nom || user?.nom || "",
        prenom: p.prenom || user?.prenom || "",
        telephone: p.telephone || user?.telephone || "",
        dateNaissance: p.dateNaissance?.split("T")[0] || "",
        adresse: p.adresse || "",
        ville: p.ville || "",
        bio: p.bio || "",
        domaineId: p.domaineId || "",
        niveauEtudeId: p.niveauEtudeId || "",
        photo: null,
        curriculumVitae: null,
      });
    }
  }, [profileData, user]);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });
  const updateSelect = (field) => (value) =>
    setForm({ ...form, [field]: value });
  const updateFile = (field) => (e) =>
    setForm({ ...form, [field]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      const { data } = await api.put(
        CANDIDATS.ME || "/candidats/me",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      toast.success("Profil mis à jour !");
      mutateProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const initials = `${form.prenom[0] || ""}${form.nom[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Mon profil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {form.prenom} {form.nom}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
                  <Upload className="h-4 w-4" />
                  {form.photo ? form.photo.name : "Changer la photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={updateFile("photo")}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={form.prenom}
                  onChange={update("prenom")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={update("nom")}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={form.telephone}
                onChange={update("telephone")}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance</Label>
              <Input
                id="dateNaissance"
                type="date"
                value={form.dateNaissance}
                onChange={update("dateNaissance")}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={form.ville}
                  onChange={update("ville")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={form.adresse}
                  onChange={update("adresse")}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profil pro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profil professionnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Domaine d'activité</Label>
              <Select
                value={form.domaineId}
                onValueChange={updateSelect("domaineId")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {domaines.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Niveau d'étude</Label>
              <Select
                value={form.niveauEtudeId}
                onValueChange={updateSelect("niveauEtudeId")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {niveaux.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Présentation</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={update("bio")}
                disabled={loading}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>CV</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                {form.curriculumVitae
                  ? form.curriculumVitae.name
                  : "Mettre à jour le CV"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={updateFile("curriculumVitae")}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
