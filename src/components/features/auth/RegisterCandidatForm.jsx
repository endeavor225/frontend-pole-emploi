import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PhoneInput } from "@/components/reui/phone-input";
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
  CalendarIcon,
} from "lucide-react";

const STEPS = [
  "Informations personnelles",
  "Profil professionnel",
  "Documents",
];

const candidatValidationSchema = Yup.object().shape({
  nom: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(80, "Maximum 80 caractères")
    .required("Nom obligatoire"),
  prenom: Yup.string()
    .min(3, "Minimum 3 caractères")
    .max(80, "Maximum 80 caractères")
    .required("Prénom obligatoire"),
  email: Yup.string()
    .email("Format d'email invalide")
    .required("Email obligatoire"),
  password: Yup.string()
    .min(8, "Minimum 8 caractères requis")
    .required("Mot de passe obligatoire"),
  password_confirmation: Yup.string()
    .oneOf(
      [Yup.ref("password"), null],
      "Les mots de passe ne correspondent pas",
    )
    .required("Confirmation obligatoire"),
  telephone: Yup.string()
    .required("Téléphone obligatoire")
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) =>
      value ? isValidPhoneNumber(value) : false,
    ),
  experience: Yup.number()
    .min(0, "L'expérience ne peut être négative")
    .required("Années d'expérience obligatoires"),
  niveauEtudeId: Yup.string()
    .uuid("Veuillez sélectionner un niveau")
    .required("Niveau d'étude obligatoire"),
  domaineId: Yup.string()
    .uuid("Veuillez sélectionner un domaine")
    .required("Domaine obligatoire"),
  sexe: Yup.string()
    .oneOf(["masculin", "feminin"], "Sexe invalide")
    .required("Sexe obligatoire"),
  etatCivil: Yup.string().required("État civil obligatoire"),
  ville: Yup.string().required("Ville obligatoire"),
  dateNaissance: Yup.date()
    .max(new Date(), "La date de naissance ne peut être dans le futur")
    .required("Date de naissance obligatoire"),
});

export function RegisterCandidatForm({ domaines, niveaux }) {
  const { registerCandidat } = useAuth();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      password_confirmation: "",
      telephone: "",
      dateNaissance: null,
      ville: "",
      bio: "",
      domaineId: "",
      niveauEtudeId: "",
      photo: null,
      curriculum_vitae: null,
      role: "CANDIDAT",
      experience: 0,
      sexe: "",
      etatCivil: "",
    },
    validationSchema: candidatValidationSchema,
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
        await registerCandidat(formData);
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
        "nom",
        "prenom",
        "email",
        "password",
        "password_confirmation",
        "telephone",
      ];
      step0Fields.forEach((f) => (fieldsToTouch[f] = true));
      stepHasErrors = step0Fields.some((f) => errors[f]);
    } else if (step === 1) {
      const step1Fields = [
        "sexe",
        "etatCivil",
        "dateNaissance",
        "ville",
        "domaineId",
        "niveauEtudeId",
        "experience",
        "bio",
      ];
      step1Fields.forEach((f) => (fieldsToTouch[f] = true));
      stepHasErrors = step1Fields.some((f) => errors[f]);
    }

    formik.setTouched({ ...formik.touched, ...fieldsToTouch }, true);

    if (!stepHasErrors) {
      setStep(step + 1);
    }
  };

  return (
    <Card className="w-full max-w-[580px] border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl">
      <CardHeader className="text-center pb-6 pt-8">
        <CardTitle className="text-2xl font-extrabold text-foreground">
          Inscription candidat
        </CardTitle>
        <CardDescription className="pt-2 font-medium">
          Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
        </CardDescription>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>

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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    {...formik.getFieldProps("prenom")}
                    className={`h-10 border-border  focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.prenom && formik.errors.prenom
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                    placeholder="Abraham"
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
                    className={`h-10 border-border  focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.nom && formik.errors.nom
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                    placeholder="KONE"
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
                  className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                    formik.touched.email && formik.errors.email
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={formik.isSubmitting}
                  placeholder="abraham@email.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-destructive">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
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
                <Label htmlFor="password">Mot de passe *</Label>
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
                  Confirmer le mot de passe *
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

          {/* Step 2: Profil professionnel */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="space-y-2">
                  <Label htmlFor="sexe">Sexe *</Label>
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
                      className={`w-full border-border  focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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
                  <Label htmlFor="etatCivil">État civil *</Label>
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
                      className={`w-full border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
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

              <div className="space-y-2 flex flex-col">
                <Label htmlFor="dateNaissance">Date de naissance *</Label>
                <Popover
                  open={datePopoverOpen}
                  onOpenChange={(open) => {
                    setDatePopoverOpen(open);
                    if (!open) {
                      formik.setFieldTouched("dateNaissance", true);
                    }
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    {...formik.getFieldProps("ville")}
                    className={`h-10 border-border focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.ville && formik.errors.ville
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                    placeholder="Ferkessédougou"
                  />
                  {formik.touched.ville && formik.errors.ville && (
                    <p className="text-xs text-destructive">
                      {formik.errors.ville}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Expérience (années) *</Label>
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
                <Label htmlFor="domaineId">Domaine d'activité *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="niveauEtudeId">Niveau d'étude *</Label>
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
                  rows={3}
                />
                {formik.touched.bio && formik.errors.bio && (
                  <p className="text-xs text-destructive">
                    {formik.errors.bio}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Step 3: Documents */}
          {step === 2 && (
            <>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo de profil</Label>
                  <div className="flex w-full items-center justify-center">
                    <label
                      htmlFor="photo"
                      className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 pb-4 pt-5 text-center px-4">
                        <Upload className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {formik.values.photo ? (
                              <span className="text-primary">
                                {formik.values.photo.name}
                              </span>
                            ) : (
                              "Mettez un visage sur votre talent !"
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formik.values.photo
                              ? "Cliquez pour modifier votre photo"
                              : "Cliquez pour uploader votre photo (JPEG, PNG)"}
                          </p>
                        </div>
                      </div>
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        formik.setFieldValue("photo", e.currentTarget.files[0])
                      }
                      disabled={formik.isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cv">Curriculum Vitae (CV)</Label>
                  <div className="flex w-full items-center justify-center">
                    <label
                      htmlFor="cv"
                      className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 pb-4 pt-5 text-center px-4">
                        <Upload className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {formik.values.curriculum_vitae ? (
                              <span className="text-primary">
                                {formik.values.curriculum_vitae.name}
                              </span>
                            ) : (
                              "Déposez votre CV ici"
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formik.values.curriculum_vitae
                              ? "Cliquez pour modifier le fichier"
                              : "Le document clé pour faire décoller votre carrière (PDF, DOC)"}
                          </p>
                        </div>
                      </div>
                    </label>
                    <input
                      id="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) =>
                        formik.setFieldValue(
                          "curriculum_vitae",
                          e.currentTarget.files[0],
                        )
                      }
                      disabled={formik.isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <Alert className="bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-500/5 dark:border-emerald-500/20">
                <AlertDescription className="text-emerald-700/90 dark:text-emerald-400/90">
                  <span>
                    Un email de vérification sera envoyé à{" "}
                    <strong className="text-emerald-900 dark:text-emerald-200">
                      {formik.values.email}
                    </strong>{" "}
                    après votre inscription.
                  </span>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="flex w-full mt-5 gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
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
                  "S'inscrire"
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
              to="/register/recruteur"
              className="text-primary font-medium hover:underline"
            >
              Inscription recruteur
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
