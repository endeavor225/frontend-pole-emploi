import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { AUTH, CANDIDATS } from "@/api/endpoints";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { isValidPhoneNumber } from "react-phone-number-input";
import { API_BASE, cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/reui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormikCombobox } from "@/components/shared/FormikCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Save, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import CompanyAvatar from "@/components/shared/CompanyAvatar";
import { AvatarUpload } from "@/components/reui/AvatarUpload";

const validationSchema = Yup.object().shape({
  nom: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(80, "Maximum 80 caractères")
    .required("Nom obligatoire"),
  prenom: Yup.string()
    .min(3, "Minimum 3 caractères")
    .max(80, "Maximum 80 caractères")
    .required("Prénom obligatoire"),
  telephone: Yup.string()
    .required("Téléphone obligatoire")
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) =>
      value ? isValidPhoneNumber(value) : false,
    ),
  dateNaissance: Yup.date()
    .max(new Date(), "La date de naissance ne peut être dans le futur")
    .required("Date de naissance obligatoire"),
  sexe: Yup.string()
    .oneOf(["masculin", "feminin"], "Sexe invalide")
    .required("Sexe obligatoire"),
  etatCivil: Yup.string().required("État civil obligatoire"),
  experience: Yup.number()
    .min(0, "L'expérience ne peut être négative")
    .required("Années d'expérience obligatoires"),
  ville: Yup.string().required("Ville obligatoire"),
  adresse: Yup.string().max(255, "Maximum 255 caractères").nullable(),
  bio: Yup.string().max(1000, "Maximum 1000 caractères").nullable(),
  domaineId: Yup.string()
    .uuid("Veuillez sélectionner un domaine")
    .required("Domaine obligatoire"),
  niveauEtudeId: Yup.string()
    .uuid("Veuillez sélectionner un niveau")
    .required("Niveau d'étude obligatoire"),
  photo: Yup.mixed()
    .nullable()
    .test("fileSize", "Taille max 2Mo", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 2 * 1024 * 1024;
    })
    .test("fileFormat", "Formats acceptés: jpg, jpeg, png", (value) => {
      if (!value || typeof value === "string") return true;
      const extension = value?.name?.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png"].includes(extension);
    }),
  curriculumVitae: Yup.mixed()
    .nullable()
    .test("fileSize", "Taille max 5Mo", (value) => {
      if (!value || typeof value === "string") return true;
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileFormat", "Formats acceptés: pdf, doc, docx", (value) => {
      if (!value || typeof value === "string") return true;
      const extension = value?.name?.split(".").pop().toLowerCase();
      return ["pdf", "doc", "docx"].includes(extension);
    }),
});

export default function MonProfilPage() {
  const { setUser } = useAuthStore();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const { data: profileData, mutate: mutateProfile } = useSWR(AUTH.ME, fetcher);
  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);

  const domaines = domainesData?.data || domainesData || [];
  const niveaux = niveauxData?.data || niveauxData || [];

  // profileData acts as the user object directly based on how AUTH.ME resolves
  const user = profileData?.user || profileData || {};

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      telephone: (user?.candidat?.telephone || user?.telephone || "").replace(
        /\s/g,
        "",
      ),
      dateNaissance: user?.candidat?.dateNaissance
        ? new Date(user.candidat.dateNaissance)
        : null,
      sexe: user?.candidat?.sexe || "",
      etatCivil: user?.candidat?.etatCivil || "",
      experience: user?.candidat?.experience || 0,
      ville: user?.candidat?.ville || "",
      adresse: user?.candidat?.adresse || "",
      bio: user?.candidat?.bio || "",
      domaineId: user?.candidat?.domaineId || "",
      niveauEtudeId: user?.candidat?.niveauEtudeId || "",
      photo: null,
      curriculumVitae: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            if (key === "dateNaissance") {
              formData.append(key, format(value, "yyyy-MM-dd"));
            } else {
              formData.append(key, value);
            }
          }
        });

        await api.put(CANDIDATS.UPDATE(user.candidat?.id), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Profil mis à jour !");

        // Update user state locally and globally
        const freshData = await mutateProfile();
        if (freshData?.user) {
          setUser(freshData.user);
        } else if (freshData) {
          setUser(freshData);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Erreur lors de la mise à jour",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const initials =
    `${formik.values.prenom[0] || ""}${formik.values.nom[0] || ""}`.toUpperCase();
  const photoUrl = user?.candidat?.photoPath
    ? `${API_BASE}${user.candidat.photoPath}`
    : null;

  const getInitials = (user) => {
    if (!user) return "?";
    const nom = user.nom || "";
    const prenom = user.prenom || "";
    return (
      `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase() || "?"
    );
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6">Mon profil</h1>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Avatar & Identité */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              <AvatarUpload
                defaultAvatar={photoUrl}
                value={formik.values.photo}
                onFileChange={(file) => {
                  formik.setFieldValue("photo", file);
                  setTimeout(() => formik.setFieldTouched("photo", true), 100);
                }}
                className="shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left sm:pt-4">
                <p className="text-2xl font-semibold">
                  {formik.values.prenom} {formik.values.nom}
                </p>
                <p className="text-muted-foreground">{user?.email}</p>
                {formik.touched.photo && formik.errors.photo && (
                  <p className="text-xs text-destructive pt-2">
                    {formik.errors.photo}
                  </p>
                )}
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
                <Label htmlFor="prenom">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prenom"
                  {...formik.getFieldProps("prenom")}
                  className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.prenom && formik.errors.prenom
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.prenom && formik.errors.prenom && (
                  <p className="text-xs text-destructive">
                    {formik.errors.prenom}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  {...formik.getFieldProps("nom")}
                  className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.nom && formik.errors.nom
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.nom && formik.errors.nom && (
                  <p className="text-xs text-destructive">
                    {formik.errors.nom}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexe">
                  Sexe <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formik.values.sexe}
                  onValueChange={(val) => formik.setFieldValue("sexe", val)}
                  onOpenChange={(open) => {
                    if (!open) formik.setFieldTouched("sexe", true);
                  }}
                  disabled={formik.isSubmitting}
                >
                  <SelectTrigger
                    size="lg"
                    className={`w-full h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.sexe && formik.errors.sexe
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculin">Homme</SelectItem>
                    <SelectItem value="feminin">Femme</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.sexe && formik.errors.sexe && (
                  <p className="text-xs text-destructive">
                    {formik.errors.sexe}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="etatCivil">
                  Situation matrimoniale{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formik.values.etatCivil}
                  onValueChange={(val) =>
                    formik.setFieldValue("etatCivil", val)
                  }
                  onOpenChange={(open) => {
                    if (!open) formik.setFieldTouched("etatCivil", true);
                  }}
                  disabled={formik.isSubmitting}
                >
                  <SelectTrigger
                    size="lg"
                    className={`w-full h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.etatCivil && formik.errors.etatCivil
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celibataire">Célibataire</SelectItem>
                    <SelectItem value="marie">Marié(e)</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.etatCivil && formik.errors.etatCivil && (
                  <p className="text-xs text-destructive">
                    {formik.errors.etatCivil}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ville">
                  Ville <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ville"
                  {...formik.getFieldProps("ville")}
                  className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.ville && formik.errors.ville
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.ville && formik.errors.ville && (
                  <p className="text-xs text-destructive">
                    {formik.errors.ville}
                  </p>
                )}
              </div>

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="dateNaissance">
                  Date de naissance <span className="text-destructive">*</span>
                </Label>
                <Popover
                  open={datePopoverOpen}
                  onOpenChange={(open) => {
                    setDatePopoverOpen(open);
                    if (!open) formik.setFieldTouched("dateNaissance", true);
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id="dateNaissance"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200",
                        !formik.values.dateNaissance && "text-muted-foreground",
                        formik.touched.dateNaissance &&
                          formik.errors.dateNaissance &&
                          "border-destructive focus-visible:ring-destructive",
                      )}
                      disabled={formik.isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formik.values.dateNaissance ? (
                        format(formik.values.dateNaissance, "PPP", {
                          locale: fr,
                        })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formik.values.dateNaissance}
                      defaultMonth={formik.values.dateNaissance}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      onSelect={(date) => {
                        formik.setFieldValue("dateNaissance", date);
                        setTimeout(
                          () => formik.setFieldTouched("dateNaissance", true),
                          100,
                        );
                        setDatePopoverOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                {formik.touched.dateNaissance &&
                  formik.errors.dateNaissance && (
                    <p className="text-xs text-destructive">
                      {formik.errors.dateNaissance}
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">
                Téléphone <span className="text-destructive">*</span>
              </Label>
              <PhoneInput
                id="telephone"
                defaultCountry="CI"
                value={formik.values.telephone}
                onChange={(value) => {
                  formik.setFieldValue("telephone", value);
                  setTimeout(
                    () => formik.setFieldTouched("telephone", true),
                    100,
                  );
                }}
                onBlur={formik.handleBlur}
                className={`h-10 border-border transition-all duration-200 focus-within:ring-primary focus-within:ring-offset-2 ${
                  formik.touched.telephone && formik.errors.telephone
                    ? "border-destructive focus-within:ring-destructive"
                    : ""
                }`}
                disabled={formik.isSubmitting}
                placeholder="+225 XX XX XX XX"
              />
              {formik.touched.telephone && formik.errors.telephone && (
                <p className="text-xs text-destructive">
                  {formik.errors.telephone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profil professionnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domaineId">
                Domaine d'activité <span className="text-destructive">*</span>
              </Label>
              <FormikCombobox
                formik={formik}
                name="domaineId"
                items={domaines}
                labelKey="libelle"
                valueKey="id"
                placeholder="Sélectionner un domaine"
                disabled={formik.isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niveauEtudeId">
                  Niveau d'étude <span className="text-destructive">*</span>
                </Label>
                <FormikCombobox
                  formik={formik}
                  name="niveauEtudeId"
                  items={niveaux}
                  labelKey="libelle"
                  valueKey="id"
                  placeholder="Sélectionner un niveau d'étude"
                  disabled={formik.isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">
                  Expérience (années){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  {...formik.getFieldProps("experience")}
                  className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.experience && formik.errors.experience
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.experience && formik.errors.experience && (
                  <p className="text-xs text-destructive">
                    {formik.errors.experience}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Présentation</Label>
              <Textarea
                id="bio"
                {...formik.getFieldProps("bio")}
                className={`border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                  formik.touched.bio && formik.errors.bio
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={formik.isSubmitting}
                placeholder="Décrivez-vous en quelques mots…"
                rows={4}
              />
              {formik.touched.bio && formik.errors.bio && (
                <p className="text-xs text-destructive">{formik.errors.bio}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv">Curriculum Vitae (CV)</Label>
              <div className="flex w-full items-center justify-center">
                <label
                  htmlFor="cv"
                  className="group flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <Upload className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        {formik.values.curriculumVitae ? (
                          <span className="text-primary truncate max-w-xs inline-block">
                            {formik.values.curriculumVitae.name ||
                              "CV actuel.pdf"}
                          </span>
                        ) : (
                          "Déposez votre CV ici"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Format PDF ou Word (max 5Mo)
                      </p>
                    </div>
                  </div>
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files[0];
                    if (file) {
                      formik.setFieldValue("curriculumVitae", file);
                      setTimeout(
                        () => formik.setFieldTouched("curriculumVitae", true),
                        100,
                      );
                    }
                  }}
                  onClick={(e) => (e.currentTarget.value = null)}
                  disabled={formik.isSubmitting}
                />
              </div>
              {formik.touched.curriculumVitae &&
                formik.errors.curriculumVitae && (
                  <p className="text-xs text-destructive mt-1">
                    {formik.errors.curriculumVitae}
                  </p>
                )}
              {user?.candidat?.curriculumVitaeUrl &&
                !formik.values.curriculumVitae?.name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-semibold text-primary">✓</span> Vous
                    avez déjà un CV enregistré.
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full h-11"
        >
          {formik.isSubmitting ? (
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
