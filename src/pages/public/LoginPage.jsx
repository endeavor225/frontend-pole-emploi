import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Loader2,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      "Format d'email invalide.",
    )
    .required("L'adresse email est requise."),
  password: Yup.string()
    .min(8, "8 caractères minimum")
    .required("Le mot de passe est requis."),
});

export default function LoginPage() {
  const { login } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const from = location.state?.from || null;

  const [showPassword, setShowPassword] = useState(false);

  /* Redirection si déjà connecté — respecte le rôle ou from */
  if (isAuthenticated) {
    const to =
      from ||
      (user?.role === "RECRUTEUR"
        ? "/recruteur/dashboard"
        : "/candidat/dashboard");
    return <Navigate to={to} replace />;
  }

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await login(values.email, values.password, from);
      } catch (error) {
        // API Error handled globally by useAuth hooks
        setStatus(error.response?.data?.message || "Identifiants incorrects");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-background">
      {/* 🌟 Header text above cards */}
      <div className="mb-6 md:mb-10 text-center w-full">
        <h1 className="text-3xl md:text-4xl font-normal text-foreground">
          Connectez-vous à votre compte !
        </h1>
      </div>

      {/* 🌟 Container holding two cards */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
        {/* 🌟 Left Card: Features Profile (Second on mobile, Left on desktop) */}
        <Card className="w-full lg:flex-1 shadow-lg border-border p-0 overflow-hidden flex flex-col order-last lg:order-first">
          <CardContent className="flex flex-col grow p-6 sm:p-8">
            <h3 className="text-xl font-bold text-primary mb-6">
              Nos avantages
            </h3>
            <ul className="space-y-4 mb-8 grow">
              {[
                "Inscription rapide",
                "Des recherches rapides et efficaces",
                "Publication d'annonces 24h/24 7j/7",
                "Plus de 1.000 recruteurs actifs",
                "Stricte confidentialité de vos données",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 relative flex items-center justify-center shrink-0">
                    <Check className="h-5 w-5 text-primary" strokeWidth={2.5} />
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {item}
                  </span>
                </li>
              ))}

              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-foreground  backdrop-blur-md flex items-center justify-center text-xs"
                    >
                      {i === 1 ? "👨‍💻" : i === 2 ? "👩‍💼" : "🧑‍🎨"}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Rejoignez plus de 10 000 professionnels.
                </p>
              </div>
            </ul>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Link
                to="/register/candidat"
                className="flex justify-center items-center h-11 px-4 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors text-center leading-tight"
              >
                S'inscrire (Candidat)
              </Link>
              <Link
                to="/register/recruteur"
                className="flex justify-center items-center h-11 px-4 text-sm font-semibold text-primary bg-background border-2 border-primary/20 hover:bg-muted/50 rounded-xl transition-colors text-center leading-tight"
              >
                S'inscrire (Recruteur)
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 🌟 Right Card: Login Form Panel (First on mobile, Right on desktop) */}
        <Card className="w-full lg:flex-1 shrink-0 shadow-lg border-border p-0 overflow-hidden flex flex-col relative order-first lg:order-last">
          <CardContent className="flex flex-col justify-center p-6 sm:p-8 grow h-full">
            <div className="w-full space-y-8 flex flex-col h-full">
              <div className="text-left ">
                <h3 className="text-xl font-bold text-primary mb-2">
                  Connexion
                </h3>
                <span className="text-sm text-muted-foreground ">
                  Connectez-vous pour gérer vos opportunités.
                </span>
              </div>

              {/* EXACT ORIGINAL FORM CONTENT */}
              <form
                onSubmit={formik.handleSubmit}
                className="space-y-6 flex flex-col grow"
              >
                {formik.status && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-xs text-rose-600 leading-tight">
                      {formik.status}
                    </p>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm text-muted-foreground"
                  >
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="prenom.nom@exemple.com"
                    {...formik.getFieldProps("email")}
                    className={`h-11 border-border bg-muted/50 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                      formik.touched.email && formik.errors.email
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    disabled={formik.isSubmitting}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm text-muted-foreground"
                    >
                      Mot de passe
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...formik.getFieldProps("password")}
                      className={`h-11 border-border bg-muted/50 pr-12 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                        formik.touched.password && formik.errors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      disabled={formik.isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
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
                    <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mt-auto pt-6 flex justify-start">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Authentification...
                      </>
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
          <BorderBeam duration={6} delay={3} size={400} borderWidth={2} />
        </Card>
      </div>
      <p className="mt-8 text-center text-sm text-slate-400">
        En vous connectant, vous acceptez nos{" "}
        <Link to="#" className="text-primary hover:underline">
          Conditions d'Utilisation
        </Link>
      </p>
    </div>
  );
}
