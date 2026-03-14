import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { AUTH } from "@/api/endpoints";
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
import { Loader2, Upload, Save, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilEntreprisePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { data: profileData, mutate } = useSWR(AUTH.ME, fetcher);
  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: secteursData } = useSWR("/secteur-activites", fetcher);

  const domaines = domainesData?.data || domainesData || [];
  const secteurs = secteursData?.data || secteursData || [];
  const entreprise = profileData?.entreprise || profileData || {};

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    nomEntreprise: "",
    description: "",
    siteWeb: "",
    adresse: "",
    ville: "",
    domaineId: "",
    secteurActiviteId: "",
    logo: null,
  });

  useEffect(() => {
    if (profileData) {
      const p = profileData.entreprise || profileData;
      setForm({
        nom: user?.nom || p.nom || "",
        prenom: user?.prenom || p.prenom || "",
        telephone: user?.telephone || p.telephone || "",
        nomEntreprise: p.nomEntreprise || "",
        description: p.description || "",
        siteWeb: p.siteWeb || "",
        adresse: p.adresse || "",
        ville: p.ville || "",
        domaineId: p.domaineId || "",
        secteurActiviteId: p.secteurActiviteId || "",
        logo: null,
      });
    }
  }, [profileData, user]);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });
  const updateSelect = (field) => (value) =>
    setForm({ ...form, [field]: value });

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
      await api.put("/entreprises/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profil mis à jour !");
      mutate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Profil entreprise</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {form.nomEntreprise || "Mon entreprise"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-primary hover:underline">
                  <Upload className="h-4 w-4" />
                  {form.logo ? form.logo.name : "Changer le logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setForm({ ...form, logo: e.target.files[0] })
                    }
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Responsable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={form.prenom}
                  onChange={update("prenom")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={form.nom}
                  onChange={update("nom")}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                type="tel"
                value={form.telephone}
                onChange={update("telephone")}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input
                value={form.nomEntreprise}
                onChange={update("nomEntreprise")}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={update("description")}
                disabled={loading}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  value={form.ville}
                  onChange={update("ville")}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Site web</Label>
                <Input
                  type="url"
                  value={form.siteWeb}
                  onChange={update("siteWeb")}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.adresse}
                onChange={update("adresse")}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Domaine</Label>
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
              <Label>Secteur d'activité</Label>
              <Select
                value={form.secteurActiviteId}
                onValueChange={updateSelect("secteurActiviteId")}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {secteurs.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
