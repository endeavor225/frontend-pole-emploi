import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

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
import { PhoneInput } from "@/components/reui/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormikCombobox } from "@/components/shared/FormikCombobox";

import {
  Eye,
  EyeOff,
  Loader2,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { FormikMultiCombobox } from "@/components/shared/FormikMultiCombobox";

const STEPS = [
  "Informations personnelles",
  "Informations entreprise",
  "Logo & Finalisation",
];

const recruteurValidationSchema = Yup.object().shape({
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
  email: Yup.string()
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      "Format d'email invalide.",
    )
    .required("Email obligatoire"),
  telephone: Yup.string()
    .required("Téléphone obligatoire")
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) =>
      value ? isValidPhoneNumber(value) : false,
    ),
  password: Yup.string()
    .min(8, "Minimum 8 caractères requis")
    .required("Mot de passe obligatoire"),
  password_confirmation: Yup.string()
    .oneOf(
      [Yup.ref("password"), null],
      "Les mots de passe ne correspondent pas",
    )
    .required("Confirmation obligatoire"),

  // Entreprise
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

  // Logo
  logo: Yup.mixed()
    .nullable()
    .test("fileSize", "Taille max 2Mo", (value) => {
      if (!value) return true;
      return value.size <= 2 * 1024 * 1024;
    })
    .test("fileFormat", "Formats acceptés: jpg, jpeg, png", (value) => {
      if (!value) return true;
      const extension = value?.name?.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png"].includes(extension);
    }),
  acceptCGU: Yup.boolean()
    .oneOf([true], "Vous devez accepter les CGU")
    .required(),
});

export function RegisterRecruteurForm({ domaines }) {
  const { registerRecruteur } = useAuth();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      civilite: "",
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      password: "",
      password_confirmation: "",
      nomEntreprise: "",
      domaineIds: [],
      adresse: "",
      ville: "",
      pays: "",
      codePostal: "",
      description: "",
      siteWeb: "",
      logo: null,
      acceptCGU: false,
      role: "RECRUTEUR",
    },
    validationSchema: recruteurValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== "" && (!Array.isArray(value) || value.length > 0)) {
            if (Array.isArray(value)) {
              value.forEach((v) => formData.append(key, v));
            } else if (key === "siteWeb" && typeof value === "string" && !value.match(/^https?:\/\//)) {
              formData.append(key, `https://${value}`);
            } else {
              formData.append(key, value);
            }
          }
        });
        await registerRecruteur(formData);
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // Handled in useAuth
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleNext = async () => {
    const errors = await formik.validateForm();
    let fieldsToTouch = {};
    let stepHasErrors = false;

    if (step === 0) {
      const step0Fields = [
        "civilite",
        "nom",
        "prenom",
        "email",
        "telephone",
        "password",
        "password_confirmation",
      ];
      step0Fields.forEach((f) => {
        fieldsToTouch[f] = true;
        if (errors[f]) stepHasErrors = true;
      });
    } else if (step === 1) {
      const step1Fields = [
        "nomEntreprise",
        "domaineIds",
        "adresse",
        "ville",
        "pays",
        "codePostal",
        "description",
        "siteWeb",
      ];
      step1Fields.forEach((f) => {
        fieldsToTouch[f] = true;
        if (errors[f]) stepHasErrors = true;
      });
    }

    formik.setTouched({ ...formik.touched, ...fieldsToTouch });

    if (!stepHasErrors) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Card className="w-full max-w-[580px] border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl">
      <CardHeader className="space-y-1 pb-6 pt-8 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
          Espace Recruteur
        </CardTitle>
        <CardDescription className="text-base font-medium text-muted-foreground">
          {isSuccess
            ? "Compte créé avec succès"
            : `Étape ${step + 1} sur ${STEPS.length} : ${STEPS[step]}`}
        </CardDescription>
        <div className="flex justify-center gap-1.5 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                step === i ? "w-16 bg-primary" : "w-2 bg-primary/20",
                isSuccess && "bg-emerald-500",
              )}
            />
          ))}
        </div>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
          <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Inscription réussie !
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Un email contenant un lien de confirmation a été envoyé à{" "}
              <strong className="text-foreground">{formik.values.email}</strong>
              . Veuillez vérifier votre boîte de réception pour activer le
              compte de votre entreprise.
            </p>
          </div>
          <div className="pt-4 w-full px-6">
            <Button asChild className="w-full" size="lg">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </div>
        </CardContent>
      ) : (
        <form
          onSubmit={formik.handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          <CardContent className="space-y-4">
            {/* Step 1: Informations personnelles */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  <div className="space-y-2">
                    <Label htmlFor="civilite">
                      Civilité <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formik.values.civilite}
                      onValueChange={(val) =>
                        formik.setFieldValue("civilite", val)
                      }
                      onOpenChange={(open) => {
                        if (!open) formik.setFieldTouched("civilite", true);
                      }}
                      disabled={formik.isSubmitting}
                    >
                      <SelectTrigger
                        size="lg"
                        className={`w-full h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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
                      className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.prenom && formik.errors.prenom
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
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
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...formik.getFieldProps("email")}
                    className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.email && formik.errors.email
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
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
                  <Label htmlFor="telephone">
                    Téléphone <span className="text-destructive">*</span>
                  </Label>
                  <PhoneInput
                    id="telephone"
                    name="telephone"
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

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Mot de passe <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...formik.getFieldProps("password")}
                      className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.password && formik.errors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      disabled={formik.isSubmitting}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
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
                    Confirmer le mot de passe{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    {...formik.getFieldProps("password_confirmation")}
                    className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.password_confirmation &&
                      formik.errors.password_confirmation
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
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
              </>
            )}

            {/* Step 2: Informations Entreprise */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nomEntreprise">
                    Nom de l'entreprise{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nomEntreprise"
                    {...formik.getFieldProps("nomEntreprise")}
                    className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.nomEntreprise &&
                      formik.errors.nomEntreprise
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
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
                  <Label htmlFor="domaineIds">
                    Domaine d'activité{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <FormikMultiCombobox
                    formik={formik}
                    name="domaineIds"
                    items={domaines}
                    labelKey="libelle"
                    valueKey="id"
                    placeholder="Sélectionner un domaine"
                    disabled={formik.isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteWeb">Site web</Label>
                  <Input
                    id="siteWeb"
                    {...formik.getFieldProps("siteWeb")}
                    className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pays">
                      Pays <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="pays"
                      {...formik.getFieldProps("pays")}
                      className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.pays && formik.errors.pays
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      disabled={formik.isSubmitting}
                      placeholder="Côte d'Ivoire"
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
                      className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.codePostal && formik.errors.codePostal
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      disabled={formik.isSubmitting}
                      placeholder="Abidjan"
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
                      className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.adresse && formik.errors.adresse
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      disabled={formik.isSubmitting}
                      placeholder="Rue des Jardins, Cocody"
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
                      className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.codePostal && formik.errors.codePostal
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      disabled={formik.isSubmitting}
                      placeholder="BP 123"
                    />
                    {formik.touched.codePostal && formik.errors.codePostal && (
                      <p className="text-xs text-destructive">
                        {formik.errors.codePostal}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description de l'entreprise{" "}
                    <span className="text-destructive">*</span>
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
                    placeholder="Décrivez l'activité de votre entreprise…"
                    rows={3}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-xs text-destructive">
                      {formik.errors.description}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Logo */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo de l'entreprise</Label>
                  <div className="flex w-full items-center justify-center">
                    <label
                      htmlFor="logo"
                      className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3 pb-6 pt-5 text-center px-4">
                        <Upload className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {formik.values.logo ? (
                              <span className="text-primary">
                                {formik.values.logo.name}
                              </span>
                            ) : (
                              "Cliquez pour choisir un logo"
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Format portrait ou carré recommandé (JPEG, PNG, max
                            2Mo)
                          </p>
                        </div>
                      </div>
                    </label>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.currentTarget.files[0];
                        if (file) {
                          formik.setFieldValue("logo", file);
                          setTimeout(
                            () => formik.setFieldTouched("logo", true),
                            100,
                          );
                        }
                      }}
                      onClick={(e) => {
                        e.currentTarget.value = null;
                      }}
                      disabled={formik.isSubmitting}
                    />
                  </div>
                  {formik.touched.logo && formik.errors.logo && (
                    <p className="text-xs text-destructive mt-1">
                      {formik.errors.logo}
                    </p>
                  )}
                </div>

                <Alert className="bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-500/5 dark:border-emerald-500/20">
                  <AlertDescription className="text-emerald-700/90 dark:text-emerald-400/90">
                    <span>
                      En vous inscrivant, vous pourrez immédiatement commencer à
                      publier vos offres de recrutement. Un email de validation
                      sera envoyé à <strong>{formik.values.email}</strong>.
                    </span>
                  </AlertDescription>
                </Alert>

                <div className="flex items-start gap-2 px-2 py-1">
                  <Checkbox
                    id="acceptCGU"
                    checked={formik.values.acceptCGU}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("acceptCGU", checked)
                    }
                    className={`mt-0.5 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.acceptCGU && formik.errors.acceptCGU
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="acceptCGU"
                      className="text-sm font-medium cursor-pointer text-foreground/90 select-none"
                    >
                      J'accepte les{" "}
                      <Link
                        to="/cgu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-bold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Conditions Générales d'Utilisation
                      </Link>{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    {formik.touched.acceptCGU && formik.errors.acceptCGU && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        {formik.errors.acceptCGU}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="flex w-full mt-5 gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={formik.isSubmitting}
                  className="flex-1 h-11 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={formik.isSubmitting}
                  className="flex-1 h-11 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={formik.handleSubmit}
                  disabled={formik.isSubmitting}
                  className="flex-1 h-11 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {formik.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Inscription…
                    </>
                  ) : (
                    "Je m'inscris"
                  )}
                </Button>
              )}
            </div>

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
      )}
    </Card>
  );
}
