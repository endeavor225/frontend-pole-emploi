import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOffre } from "@/hooks/useOffres";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormikMultiCombobox } from "@/components/shared/FormikMultiCombobox";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Loader2, ArrowLeft, CalendarIcon, Send } from "lucide-react";
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
    .nullable()
    .transform((value) => (isNaN(value) ? null : value)),
  salaireMax: Yup.number()
    .min(
      Yup.ref("salaireMin"),
      "Doit être supérieur ou égal au salaire minimum",
    )
    .nullable()
    .transform((value) => (isNaN(value) ? null : value)),
  typeOffre: Yup.string()
    .oneOf(
      ["CDI", "CDD", "Stage", "Interim", "Freelance", "Consultance"],
      "Type d'offre invalide",
    )
    .required("Type d'offre obligatoire"),
  localisation: Yup.string().required("Localisation obligatoire"),
  dateLimite: Yup.date()
    .min(new Date(), "La date limite doit être dans le futur")
    .required("Date limite obligatoire"),
  niveauxEtudeIds: Yup.array()
    .of(Yup.string().uuid("ID invalide"))
    .min(1, "Sélectionnez au moins un niveau d'étude")
    .required("Requis"),
  domaineIds: Yup.array()
    .of(Yup.string().uuid("ID invalide"))
    .min(1, "Sélectionnez au moins un domaine")
    .required("Requis"),
});

export default function NouvelleOffrePage() {
  const navigate = useNavigate();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);
  const domaines = domainesData?.data || domainesData || [];
  const niveaux = niveauxData?.data || niveauxData || [];

  const formik = useFormik({
    initialValues: {
      titre: "",
      description: "",
      experienceMin: 0,
      salaireMin: "",
      salaireMax: "",
      typeOffre: "",
      localisation: "",
      dateLimite: null,
      domaineIds: [],
      niveauxEtudeIds: [],
    },
    validationSchema: offreValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { ...values };
        if (payload.salaireMax === "" || isNaN(payload.salaireMax)) {
          payload.salaireMax = null;
        }
        // Formatage de la date en string ISO pour le backend
        if (payload.dateLimite) {
          payload.dateLimite = format(payload.dateLimite, "yyyy-MM-dd");
        }

        // Fix pour domaine_id singulier si nécessaire
        if (payload.domaineIds?.length > 0) {
          payload.domaine_id = payload.domaineIds[0];
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

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight ">Nouvelle offre</h1>
        <p className="text-muted-foreground">
          Publiez une nouvelle opportunité de recrutement
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Section 1 : Détails de l'offre */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titre">
                Titre de l'offre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titre"
                {...formik.getFieldProps("titre")}
                placeholder="Ex: Développeur Full Stack React/Node"
                className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                  formik.touched.titre && formik.errors.titre
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={formik.isSubmitting}
              />
              {formik.touched.titre && formik.errors.titre && (
                <p className="text-xs text-destructive">
                  {formik.errors.titre}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeOffre">
                  Type de contrat <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formik.values.typeOffre}
                  onValueChange={(val) =>
                    formik.setFieldValue("typeOffre", val)
                  }
                  onOpenChange={(open) => {
                    if (!open) formik.setFieldTouched("typeOffre", true);
                  }}
                  disabled={formik.isSubmitting}
                >
                  <SelectTrigger
                    size="lg"
                    className={`w-full h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.typeOffre && formik.errors.typeOffre
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_OFFRE.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.typeOffre && formik.errors.typeOffre && (
                  <p className="text-xs text-destructive">
                    {formik.errors.typeOffre}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="localisation">
                  Localisation <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="localisation"
                  {...formik.getFieldProps("localisation")}
                  placeholder="Ex: Abidjan, Cocody"
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.localisation && formik.errors.localisation
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.localisation && formik.errors.localisation && (
                  <p className="text-xs text-destructive">
                    {formik.errors.localisation}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceMin">
                  Année(s) d'expérience minimum requise{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="experienceMin"
                    type="number"
                    min="0"
                    {...formik.getFieldProps("experienceMin")}
                    className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.experienceMin &&
                      formik.errors.experienceMin
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                  />
                  <span className="absolute right-7 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    An(s)
                  </span>
                </div>
                {formik.touched.experienceMin &&
                  formik.errors.experienceMin && (
                    <p className="text-xs text-destructive">
                      {formik.errors.experienceMin}
                    </p>
                  )}
              </div>

              <div className="space-y-2 ">
                <Label htmlFor="dateLimite">
                  Date limite de candidature{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Popover
                  open={datePopoverOpen}
                  onOpenChange={(open) => {
                    setDatePopoverOpen(open);
                    if (!open) formik.setFieldTouched("dateLimite", true);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id="dateLimite"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200",
                        !formik.values.dateLimite && "text-muted-foreground",
                        formik.touched.dateLimite &&
                          formik.errors.dateLimite &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      disabled={formik.isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formik.values.dateLimite ? (
                        format(formik.values.dateLimite, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formik.values.dateLimite}
                      defaultMonth={formik.values.dateLimite || new Date()}
                      captionLayout="dropdown"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 2}
                      onSelect={(date) => {
                        formik.setFieldValue("dateLimite", date);
                        setTimeout(
                          () => formik.setFieldTouched("dateLimite", true),
                          100,
                        );
                        setDatePopoverOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                {formik.touched.dateLimite && formik.errors.dateLimite && (
                  <p className="text-xs text-destructive">
                    {formik.errors.dateLimite}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description du poste <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                id="description"
                value={formik.values.description}
                onChange={(content) =>
                  formik.setFieldValue("description", content)
                }
                onBlur={() => formik.setFieldTouched("description", true)}
                placeholder="Missions, compétences techniques, avantages, environnement de travail…"
                error={formik.touched.description && formik.errors.description}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-destructive">
                  {formik.errors.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2 : Exigences et Domaines */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Critères de sélection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>
                Domaines d'activité <span className="text-destructive">*</span>
              </Label>
              <FormikMultiCombobox
                formik={formik}
                name="domaineIds"
                items={domaines}
                labelKey="libelle"
                valueKey="id"
                placeholder="Sélectionner un ou plusieurs domaines"
                disabled={formik.isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Niveaux d'étude requis{" "}
                <span className="text-destructive">*</span>
              </Label>
              <FormikMultiCombobox
                formik={formik}
                name="niveauxEtudeIds"
                items={niveaux}
                labelKey="libelle"
                valueKey="id"
                placeholder="Sélectionner un ou plusieurs niveaux"
                disabled={formik.isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3 : Rémunération et Limite */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Rémunération et Délai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaireMin">Salaire minimum</Label>
                <div className="relative">
                  <Input
                    id="salaireMin"
                    type="number"
                    {...formik.getFieldProps("salaireMin")}
                    className={`h-11 pl-4 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.salaireMin && formik.errors.salaireMin
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    FCFA
                  </span>
                </div>
                {formik.touched.salaireMin && formik.errors.salaireMin && (
                  <p className="text-xs text-destructive">
                    {formik.errors.salaireMin}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaireMax">Salaire maximum</Label>
                <div className="relative">
                  <Input
                    id="salaireMax"
                    type="number"
                    {...formik.getFieldProps("salaireMax")}
                    className={`h-11 pl-4 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.salaireMax && formik.errors.salaireMax
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    FCFA
                  </span>
                </div>
                {formik.touched.salaireMax && formik.errors.salaireMax && (
                  <p className="text-xs text-destructive">
                    {formik.errors.salaireMax}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 px-8 flex-1 sm:flex-none border-border hover:bg-destructive"
            onClick={() => navigate(-1)}
            disabled={formik.isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            size="lg"
            className="h-12 px-8 flex-1 sm:flex-none bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publication...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Publier l'offre
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
