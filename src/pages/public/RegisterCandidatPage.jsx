import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  Upload,
  ArrowLeft,
  ArrowRight,
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
    .min(10, "Minimum 10 chiffres")
    .max(15, "Maximum 15 chiffres")
    .required("Téléphone obligatoire"),
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

export default function RegisterCandidatPage() {
  const { registerCandidat } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch domaines & niveaux d'étude
  const { data: domainesData } = useSWR("/domaines", fetcher);
  const { data: niveauxData } = useSWR("/niveau-etudes", fetcher);

  const domaines = domainesData?.data || domainesData || [];
  const niveaux = niveauxData?.data || niveauxData || [];

  const formik = useFormik({
    initialValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      password_confirmation: "",
      telephone: "",
      dateNaissance: "",
      adresse: "",
      ville: "",
      bio: "",
      domaineId: "",
      niveauEtudeId: "",
      photo: null,
      curriculum_vitae: null,
      role: "CANDIDAT",
      experience: 0,
      sexe: "masculin",
      etatCivil: "celibataire",
    },
    validationSchema: candidatValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            formData.append(key, value);
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

  if (isAuthenticated) return <Navigate to="/" replace />;

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
        "dateNaissance",
        "ville",
        "adresse",
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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Inscription Candidat</CardTitle>
          <CardDescription>
            Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
          </CardDescription>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <form onSubmit={formik.handleSubmit}>
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
                    placeholder="jean@email.com"
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
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
              </>
            )}

            {/* Step 2: Profil professionnel */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dateNaissance">Date de naissance *</Label>
                  <Input
                    id="dateNaissance"
                    type="date"
                    {...formik.getFieldProps("dateNaissance")}
                    className={
                      formik.touched.dateNaissance &&
                      formik.errors.dateNaissance
                        ? "border-destructive"
                        : ""
                    }
                    disabled={formik.isSubmitting}
                  />
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
                    <Label htmlFor="experience">Expérience (années) *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      {...formik.getFieldProps("experience")}
                      className={
                        formik.touched.experience && formik.errors.experience
                          ? "border-destructive"
                          : ""
                      }
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
                  <Select
                    value={formik.values.domaineId}
                    onValueChange={(val) =>
                      formik.setFieldValue("domaineId", val)
                    }
                    disabled={formik.isSubmitting}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.domaineId && formik.errors.domaineId
                          ? "border-destructive"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Sélectionner un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      {domaines.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.domaineId && formik.errors.domaineId && (
                    <p className="text-xs text-destructive">
                      {formik.errors.domaineId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niveauEtudeId">Niveau d'étude *</Label>
                  <Select
                    value={formik.values.niveauEtudeId}
                    onValueChange={(val) =>
                      formik.setFieldValue("niveauEtudeId", val)
                    }
                    disabled={formik.isSubmitting}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.niveauEtudeId &&
                        formik.errors.niveauEtudeId
                          ? "border-destructive"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {niveaux.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.niveauEtudeId &&
                    formik.errors.niveauEtudeId && (
                      <p className="text-xs text-destructive">
                        {formik.errors.niveauEtudeId}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Présentation</Label>
                  <Textarea
                    id="bio"
                    {...formik.getFieldProps("bio")}
                    className={
                      formik.touched.bio && formik.errors.bio
                        ? "border-destructive"
                        : ""
                    }
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
                <div className="space-y-2">
                  <Label htmlFor="photo">Photo de profil</Label>
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="photo"
                      className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Upload className="h-4 w-4" />
                      {formik.values.photo
                        ? formik.values.photo.name
                        : "Choisir une photo"}
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
                  <div className="flex items-center gap-4">
                    <label
                      htmlFor="cv"
                      className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Upload className="h-4 w-4" />
                      {formik.values.curriculum_vitae
                        ? formik.values.curriculum_vitae.name
                        : "Choisir un fichier (PDF, DOC)"}
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

                <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                  <p>
                    📧 Un email de vérification sera envoyé à{" "}
                    <strong>{formik.values.email}</strong> après inscription.
                  </p>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="flex w-full gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={formik.isSubmitting}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={formik.isSubmitting}
                  className="flex-1"
                >
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex-1"
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
    </div>
  );
}
