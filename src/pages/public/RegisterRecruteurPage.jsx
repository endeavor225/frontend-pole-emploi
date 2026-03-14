import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Building2, Loader2, Upload } from "lucide-react";

const recruteurValidationSchema = Yup.object().shape({
  nom: Yup.string().required("Nom obligatoire"),
  prenom: Yup.string().required("Prénom obligatoire"),
  email: Yup.string().email("Format invalide").required("Email obligatoire"),
  password: Yup.string()
    .min(8, "Minimum 8 caractères")
    .required("Mot de passe obligatoire"),
  password_confirmation: Yup.string()
    .oneOf(
      [Yup.ref("password"), null],
      "Les mots de passe ne correspondent pas",
    )
    .required("Confirmation obligatoire"),
  nomEntreprise: Yup.string().required("Nom de l'entreprise obligatoire"),
  description: Yup.string().required("Description de l'entreprise obligatoire"),
  telephone: Yup.string().required("Téléphone obligatoire"),
  domaineId: Yup.string()
    .uuid("Sélection invalide")
    .required("Domaine d'activité obligatoire"),
  secteurActiviteId: Yup.string()
    .uuid("Sélection invalide")
    .required("Secteur d'activité obligatoire"),
  adresse: Yup.string().required("Adresse obligatoire"),
  ville: Yup.string().required("Ville obligatoire"),
  site_web: Yup.string()
    .url("URL invalide (ex: https://monsite.com)")
    .optional(),
});

export default function RegisterRecruteurPage() {
  const { registerRecruteur } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showPassword, setShowPassword] = useState(false);

  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: secteursData } = useSWR("/secteur-activites", fetcher);

  const domaines = domainesData?.data || domainesData || [];
  const secteurs = secteursData?.data || secteursData || [];

  const formik = useFormik({
    initialValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      password_confirmation: "",
      telephone: "",
      nomEntreprise: "",
      description: "",
      site_web: "",
      adresse: "",
      ville: "",
      domaineId: "",
      secteurActiviteId: "71d0bdf7-97eb-4a53-a9b8-a99dafccd0bd",
      logo: null,
      role: "RECRUTEUR",
    },
    validationSchema: recruteurValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            if (key === "site_web" && !value.match(/^https?:\/\//)) {
              formData.append(key, `https://${value}`);
            } else {
              formData.append(key, value);
            }
          }
        });
        await registerRecruteur(formData);
      } catch {
        // Handled in useAuth
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const selectedDomaine = useMemo(() => {
    return domaines.find((d) => d.id === formik.values.domaineId);
  }, [domaines, formik.values.domaineId]);
  /* const selectedDomaine = domaines.find(
    (d) => d.id === formik.values.domaineId,
  ); */

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Inscription Recruteur</CardTitle>
          <CardDescription>
            Créez votre compte pour publier des offres d'emploi
          </CardDescription>
        </CardHeader>

        <form onSubmit={formik.handleSubmit}>
          <CardContent className="space-y-6">
            {/* Section: Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    {...formik.getFieldProps("prenom")}
                    className={
                      formik.touched.prenom && formik.errors.prenom
                        ? "border-destructive"
                        : ""
                    }
                    disabled={formik.isSubmitting}
                    placeholder="Jean"
                  />
                  {formik.touched.prenom && formik.errors.prenom && (
                    <p className="text-xs text-destructive">
                      {formik.errors.prenom}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    {...formik.getFieldProps("nom")}
                    className={
                      formik.touched.nom && formik.errors.nom
                        ? "border-destructive"
                        : ""
                    }
                    disabled={formik.isSubmitting}
                    placeholder="Dupont"
                  />
                  {formik.touched.nom && formik.errors.nom && (
                    <p className="text-xs text-destructive">
                      {formik.errors.nom}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                  className={
                    formik.touched.email && formik.errors.email
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="contact@entreprise.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-destructive">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  type="tel"
                  {...formik.getFieldProps("telephone")}
                  className={
                    formik.touched.telephone && formik.errors.telephone
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="+225 XX XX XX XX"
                />
                {formik.touched.telephone && formik.errors.telephone && (
                  <p className="text-xs text-destructive">
                    {formik.errors.telephone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...formik.getFieldProps("password")}
                    className={
                      formik.touched.password && formik.errors.password
                        ? "border-destructive"
                        : ""
                    }
                    disabled={formik.isSubmitting}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-destructive">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Confirmer le mot de passe *
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  {...formik.getFieldProps("password_confirmation")}
                  className={
                    formik.touched.password_confirmation &&
                    formik.errors.password_confirmation
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="••••••••"
                />
                {formik.touched.password_confirmation &&
                  formik.errors.password_confirmation && (
                    <p className="text-xs text-destructive">
                      {formik.errors.password_confirmation}
                    </p>
                  )}
              </div>
            </div>

            {/* Section: Entreprise */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Informations entreprise
              </h3>

              <div className="space-y-2">
                <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
                <Input
                  id="nom_entreprise"
                  {...formik.getFieldProps("nomEntreprise")}
                  className={
                    formik.touched.nomEntreprise && formik.errors.nomEntreprise
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="Ma Société SARL"
                />
                {formik.touched.nomEntreprise &&
                  formik.errors.nomEntreprise && (
                    <p className="text-xs text-destructive">
                      {formik.errors.nomEntreprise}
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
                  placeholder="Décrivez votre entreprise…"
                  rows={3}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-xs text-destructive">
                    {formik.errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    {...formik.getFieldProps("ville")}
                    className={
                      formik.touched.ville && formik.errors.ville
                        ? "border-destructive"
                        : ""
                    }
                    disabled={formik.isSubmitting}
                    placeholder="Ferkéssédougou"
                  />
                  {formik.touched.ville && formik.errors.ville && (
                    <p className="text-xs text-destructive">
                      {formik.errors.ville}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_web">Site web</Label>
                  <Input
                    id="site_web"
                    type="url"
                    {...formik.getFieldProps("site_web")}
                    className={
                      formik.touched.site_web && formik.errors.site_web
                        ? "border-destructive"
                        : ""
                    }
                    disabled={formik.isSubmitting}
                    placeholder="https://..."
                  />
                  {formik.touched.site_web && formik.errors.site_web && (
                    <p className="text-xs text-destructive">
                      {formik.errors.site_web}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <Input
                  id="adresse"
                  {...formik.getFieldProps("adresse")}
                  className={
                    formik.touched.adresse && formik.errors.adresse
                      ? "border-destructive"
                      : ""
                  }
                  disabled={formik.isSubmitting}
                  placeholder="Quartier..."
                />
                {formik.touched.adresse && formik.errors.adresse && (
                  <p className="text-xs text-destructive">
                    {formik.errors.adresse}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domaine_id">Domaine d'activité *</Label>
                <Combobox
                  items={domaines}
                  itemToStringValue={(domaine) => domaine.libelle}
                  filter={(item, search) =>
                    item.libelle.toLowerCase().includes(search.toLowerCase())
                  }
                  value={selectedDomaine?.libelle || ""}
                  onValueChange={(val) => {
                    const selected = domaines.find((d) => d.libelle === val);
                    formik.setFieldValue("domaineId", selected?.id || "");
                  }}
                  disabled={formik.isSubmitting}
                >
                  <ComboboxInput
                    showClear
                    placeholder="Sélectionner un domaine"
                    className={`w-full ${
                      formik.touched.domaineId && formik.errors.domaineId
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Aucun domaine trouvé.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem
                          key={item.id}
                          value={item.libelle}
                          textValue={item.libelle}
                        >
                          {item.libelle}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {formik.touched.domaineId && formik.errors.domaineId && (
                  <p className="text-xs text-destructive">
                    {formik.errors.domaineId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="secteur_activite_id">
                  Secteur d'activité *
                </Label>
                <Combobox
                  value={formik.values.secteurActiviteId}
                  onValueChange={(val) =>
                    formik.setFieldValue("secteurActiviteId", val)
                  }
                  disabled={formik.isSubmitting}
                >
                  <ComboboxInput
                    placeholder="Sélectionner un secteur"
                    className={`w-full ${
                      formik.touched.secteurActiviteId &&
                      formik.errors.secteurActiviteId
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxEmpty>Aucun secteur trouvé.</ComboboxEmpty>
                      {secteurs.map((s) => (
                        <ComboboxItem key={s.id} value={s.id}>
                          {s.libelle}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {formik.touched.secteurActiviteId &&
                  formik.errors.secteurActiviteId && (
                    <p className="text-xs text-destructive">
                      {formik.errors.secteurActiviteId}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de l'entreprise</Label>
                <label
                  htmlFor="logo"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Upload className="h-4 w-4" />
                  {formik.values.logo
                    ? formik.values.logo.name
                    : "Choisir un logo"}
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    formik.setFieldValue("logo", e.currentTarget.files[0])
                  }
                  disabled={formik.isSubmitting}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscription…
                </>
              ) : (
                "S'inscrire comme recruteur"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Se connecter
              </Link>
              {" · "}
              <Link
                to="/register/candidat"
                className="text-primary font-medium hover:underline"
              >
                Inscription candidat
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
