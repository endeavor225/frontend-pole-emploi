import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import api from "@/api/axios";
import { AUTH, ENTREPRISES } from "@/api/endpoints";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";

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
import { FormikMultiCombobox } from "@/components/shared/FormikMultiCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/reui/AvatarUpload";
import { API_BASE } from "@/lib/utils";

const validationSchema = Yup.object().shape({
  civilite: Yup.string()
    .oneOf(["M", "Mme", "Mlle"], "Civilité invalide")
    .required("Civilité obligatoire"),
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
  nomEntreprise: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(150, "Maximum 150 caractères")
    .required("Nom de l'entreprise obligatoire"),
  domaineIds: Yup.array()
    .of(Yup.string().uuid("ID de domaine invalide"))
    .min(1, "Veuillez sélectionner au moins un domaine")
    .required("Domaine d'activité obligatoire"),
  adresse: Yup.string()
    .max(255, "Maximum 255 caractères")
    .required("Adresse obligatoire"),
  ville: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères")
    .required("Ville obligatoire"),
  pays: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(100, "Maximum 100 caractères")
    .required("Pays obligatoire"),
  codePostal: Yup.string()
    .max(20, "Maximum 20 caractères")
    .required("Code postal obligatoire"),
  description: Yup.string()
    .max(500, "Maximum 500 caractères")
    .required("Description obligatoire"),
  siteWeb: Yup.string()
    .matches(
      /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/.*)?$/i,
      "URL invalide (ex: monsite.com ou https://monsite.com)",
    )
    .nullable(),
  logo: Yup.mixed()
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
});

export default function ProfilEntreprisePage() {
  const { setUser, user } = useAuthStore();
  const { mutate } = useSWR(AUTH.ME, fetcher);
  const { data: domainesData } = useSWR("/domaines", fetcher);

  const domaines = domainesData?.data || domainesData || [];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      civilite: user?.entreprise?.civilite || "",
      nom: user?.nom || "",
      prenom: user?.prenom || "",
      telephone: (user?.entreprise?.telephone || "").replace(/\s/g, ""),
      nomEntreprise: user?.entreprise?.nomEntreprise || "",
      description: user?.entreprise?.description || "",
      siteWeb: user?.entreprise?.siteWeb || "",
      adresse: user?.entreprise?.adresse || "",
      ville: user?.entreprise?.ville || "",
      pays: user?.entreprise?.pays || "",
      codePostal: user?.entreprise?.codePostal || "",
      domaineIds: user?.entreprise?.domaines?.map((d) => d.id) || [],
      logo: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== "" &&
            (!Array.isArray(value) || value.length > 0)
          ) {
            if (Array.isArray(value)) {
              value.forEach((v) => formData.append(key, v));
            } else if (
              key === "siteWeb" &&
              typeof value === "string" &&
              !value.match(/^https?:\/\//)
            ) {
              formData.append(key, `https://${value}`);
            } else {
              formData.append(key, value);
            }
          }
        });
        await api.put(ENTREPRISES.UPDATE(user.entreprise?.id), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Profil mis à jour !");

        // Mettre à jour l'utilisateur dans le store Zustand global
        const freshData = await mutate();
        if (freshData?.user) {
          setUser(freshData.user);
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

  const logoUrl = user?.entreprise?.logoPath
    ? `${API_BASE}${user.entreprise.logoPath}`
    : null;

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6">Profil entreprise</h1>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Photo */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
              <AvatarUpload
                defaultAvatar={logoUrl}
                value={formik.values.logo}
                onFileChange={(file) => {
                  formik.setFieldValue("logo", file);
                  setTimeout(() => formik.setFieldTouched("logo", true), 100);
                }}
                className="shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left sm:pt-4">
                <p className="text-2xl font-semibold">
                  {formik.values.nomEntreprise || "Mon entreprise"}
                </p>
                <p className="text-muted-foreground">{user?.email}</p>
                {formik.touched.logo && formik.errors.logo && (
                  <p className="text-xs text-destructive pt-2">
                    {formik.errors.logo}
                  </p>
                )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div className="space-y-2">
                <Label htmlFor="civilite">
                  Civilité <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formik.values.civilite}
                  onValueChange={(val) => formik.setFieldValue("civilite", val)}
                  onOpenChange={(open) => {
                    if (!open) formik.setFieldTouched("civilite", true);
                  }}
                  disabled={formik.isSubmitting}
                >
                  <SelectTrigger
                    size="lg"
                    className={`w-full h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.civilite && formik.errors.civilite
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Monsieur</SelectItem>
                    <SelectItem value="Mme">Madame</SelectItem>
                    <SelectItem value="Mlle">Mademoiselle</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.civilite && formik.errors.civilite && (
                  <p className="text-xs text-destructive">
                    {formik.errors.civilite}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="prenom"
                  {...formik.getFieldProps("prenom")}
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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
                className={`h-11 border-border transition-all duration-200 focus-within:ring-primary focus-within:ring-offset-2 ${
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

        {/* Entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomEntreprise">
                Nom de l'entreprise <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomEntreprise"
                {...formik.getFieldProps("nomEntreprise")}
                className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                  formik.touched.nomEntreprise && formik.errors.nomEntreprise
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={formik.isSubmitting}
              />
              {formik.touched.nomEntreprise && formik.errors.nomEntreprise && (
                <p className="text-xs text-destructive">
                  {formik.errors.nomEntreprise}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...formik.getFieldProps("description")}
                className={`border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                  formik.touched.description && formik.errors.description
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={formik.isSubmitting}
                rows={4}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-destructive">
                  {formik.errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pays">
                  Pays <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pays"
                  {...formik.getFieldProps("pays")}
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.pays && formik.errors.pays
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.pays && formik.errors.pays && (
                  <p className="text-xs text-destructive">
                    {formik.errors.pays}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">
                  Ville <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ville"
                  {...formik.getFieldProps("ville")}
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adresse">
                  Adresse <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="adresse"
                  {...formik.getFieldProps("adresse")}
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.adresse && formik.errors.adresse
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.adresse && formik.errors.adresse && (
                  <p className="text-xs text-destructive">
                    {formik.errors.adresse}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="codePostal">
                  Code Postal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codePostal"
                  {...formik.getFieldProps("codePostal")}
                  className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.codePostal && formik.errors.codePostal
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                />
                {formik.touched.codePostal && formik.errors.codePostal && (
                  <p className="text-xs text-destructive">
                    {formik.errors.codePostal}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteWeb">Site web</Label>
              <Input
                id="siteWeb"
                {...formik.getFieldProps("siteWeb")}
                className={`h-11 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                  formik.touched.siteWeb && formik.errors.siteWeb
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                disabled={formik.isSubmitting}
                placeholder="https://www.monsite.com"
              />
              {formik.touched.siteWeb && formik.errors.siteWeb && (
                <p className="text-xs text-destructive">
                  {formik.errors.siteWeb}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domaineIds">
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
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
