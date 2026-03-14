import { useNavigate } from "react-router-dom";
import { createOffre } from "@/hooks/useOffres";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { useFormik } from "formik";
import * as Yup from "yup";
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

const offreValidationSchema = Yup.object().shape({
  titre: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(150, "Maximum 150 caractères")
    .required("Titre obligatoire"),
  description: Yup.string().required("Description obligatoire"),
  experienceMin: Yup.number()
    .min(0, "Ne peut être négatif")
    .required("Expérience minimum requise"),
  salaireMin: Yup.number()
    .min(0, "Ne peut être négatif")
    .required("Salaire minimum requis"),
  salaireMax: Yup.number()
    .min(
      Yup.ref("salaireMin"),
      "Doit être supérieur ou égal au salaire minimum",
    )
    .optional()
    .nullable(),
  type_offre: Yup.string()
    .oneOf(
      ["Emploi", "Stage", "Interim", "Freelance", "Consultance"],
      "Type d'offre invalide",
    )
    .required("Type d'offre obligatoire"),
  localisation: Yup.string().required("Localisation obligatoire"),
  dateLimite: Yup.date()
    .min(new Date(), "La date limite doit être dans le futur")
    .required("Date limite obligatoire"),
  niveauxEtudeIds: Yup.array()
    .of(Yup.string().uuid())
    .min(1, "Sélectionnez au moins un niveau d'étude")
    .required("Requis"),
  domaineIds: Yup.array()
    .of(Yup.string().uuid())
    .min(1, "Sélectionnez au moins un domaine")
    .required("Requis"),
});

export default function NouvelleOffrePage() {
  const navigate = useNavigate();

  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);
  const domaines = domainesData?.data || domainesData || [];
  const niveaux = niveauxData?.data || niveauxData || [];

  const formik = useFormik({
    initialValues: {
      titre: "",
      description: "",
      experienceMin: 0,
      salaireMin: 0,
      salaireMax: "",
      type_offre: "",
      localisation: "",
      dateLimite: "",
      domaineIds: [],
      niveauxEtudeIds: [],
    },
    validationSchema: offreValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { ...values };
        if (payload.salaireMax === "") {
          payload.salaireMax = null; // Backend might expect null if empty
        }
        await createOffre(payload);
        toast.success("Offre créée avec succès !");
        navigate("/recruteur/offres");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Erreur lors de la création",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleArrayItem = (field, id) => {
    const currentList = formik.values[field];
    if (currentList.includes(id)) {
      formik.setFieldValue(
        field,
        currentList.filter((x) => x !== id),
      );
    } else {
      formik.setFieldValue(field, [...currentList, id]);
    }
  };

  return (
    <div className="max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-8"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nouvelle offre d'emploi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de l'offre *</Label>
              <Input
                id="titre"
                {...formik.getFieldProps("titre")}
                className={
                  formik.touched.titre && formik.errors.titre
                    ? "border-destructive"
                    : ""
                }
                disabled={formik.isSubmitting}
                placeholder="Ex: Développeur Full Stack"
              />
              {formik.touched.titre && formik.errors.titre && (
                <p className="text-xs text-destructive">
                  {formik.errors.titre}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...formik.getFieldProps("description")}
                className={
                  formik.touched.description && formik.errors.description
                    ? "border-destructive"
                    : ""
                }
                disabled={formik.isSubmitting}
                rows={6}
                placeholder="Décrivez le poste, les responsabilités, les compétences requises…"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-destructive">
                  {formik.errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type d'offre *</Label>
                <Select
                  value={formik.values.type_offre}
                  onValueChange={(val) =>
                    formik.setFieldValue("type_offre", val)
                  }
                  disabled={formik.isSubmitting}
                >
                  <SelectTrigger
                    className={
                      formik.touched.type_offre && formik.errors.type_offre
                        ? "border-destructive"
                        : ""
                    }
                  >
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
                {formik.touched.type_offre && formik.errors.type_offre && (
                  <p className="text-xs text-destructive">
                    {formik.errors.type_offre}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation *</Label>
                <Input
                  id="localisation"
                  {...formik.getFieldProps("localisation")}
                  className={
                    formik.touched.localisation && formik.errors.localisation
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="Ferkéssédougou"
                />
                {formik.touched.localisation && formik.errors.localisation && (
                  <p className="text-xs text-destructive">
                    {formik.errors.localisation}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceMin">Expérience min * (ans)</Label>
                <Input
                  id="experienceMin"
                  type="number"
                  min="0"
                  {...formik.getFieldProps("experienceMin")}
                  className={
                    formik.touched.experienceMin && formik.errors.experienceMin
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                />
                {formik.touched.experienceMin &&
                  formik.errors.experienceMin && (
                    <p className="text-xs text-destructive">
                      {formik.errors.experienceMin}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaireMin">Salaire minimum *</Label>
                <Input
                  id="salaireMin"
                  type="number"
                  min="0"
                  {...formik.getFieldProps("salaireMin")}
                  className={
                    formik.touched.salaireMin && formik.errors.salaireMin
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="ex: 150000"
                />
                {formik.touched.salaireMin && formik.errors.salaireMin && (
                  <p className="text-xs text-destructive">
                    {formik.errors.salaireMin}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaireMax">Salaire maximum</Label>
                <Input
                  id="salaireMax"
                  type="number"
                  min="0"
                  {...formik.getFieldProps("salaireMax")}
                  className={
                    formik.touched.salaireMax && formik.errors.salaireMax
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                />
                {formik.touched.salaireMax && formik.errors.salaireMax && (
                  <p className="text-xs text-destructive">
                    {formik.errors.salaireMax}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateLimite">Date limite *</Label>
              <Input
                id="dateLimite"
                type="date"
                {...formik.getFieldProps("dateLimite")}
                className={
                  formik.touched.dateLimite && formik.errors.dateLimite
                    ? "border-destructive"
                    : ""
                }
                disabled={formik.isSubmitting}
              />
              {formik.touched.dateLimite && formik.errors.dateLimite && (
                <p className="text-xs text-destructive">
                  {formik.errors.dateLimite}
                </p>
              )}
            </div>

            {/* Multi-select Domaines */}
            <div className="space-y-2">
              <Label>Domaines d'activité *</Label>
              <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto">
                {domaines.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleArrayItem("domaineIds", d.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formik.values.domaineIds.includes(d.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {d.libelle}
                  </button>
                ))}
              </div>
              {formik.values.domaineIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formik.values.domaineIds.length} sélectionné(s)
                </p>
              )}
              {formik.touched.domaineIds && formik.errors.domaineIds && (
                <p className="text-xs text-destructive">
                  {formik.errors.domaineIds}
                </p>
              )}
            </div>

            {/* Multi-select Niveaux */}
            <div className="space-y-2">
              <Label>Niveaux d'étude requis *</Label>
              <div className="flex flex-wrap gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto">
                {niveaux.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleArrayItem("niveauxEtudeIds", n.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      formik.values.niveauxEtudeIds.includes(n.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {n.libelle}
                  </button>
                ))}
              </div>
              {formik.touched.niveauxEtudeIds &&
                formik.errors.niveauxEtudeIds && (
                  <p className="text-xs text-destructive">
                    {formik.errors.niveauxEtudeIds}
                  </p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={formik.isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                className="flex-1"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création…
                  </>
                ) : (
                  "Publier l'offre"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
