import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  AlertCircle,
  LogIn,
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

export function LoginForm() {
  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from || null;

  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <Card className="w-full max-w-[580px] py-0 border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl relative overflow-hidden">
      <CardHeader className="text-center pb-4 pt-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          Connexion
        </CardTitle>
        <CardDescription className="pt-2 font-medium">
          Connectez-vous pour gérer vos opportunités
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center p-6 sm:p-8 pt-0 grow h-full">
        <div className="w-full space-y-8 flex flex-col h-full">
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
              <Label htmlFor="email" className="text-sm font-medium">
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
                <Label htmlFor="password" className="text-sm font-medium">
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
            <div className="mt-auto pt-4 flex justify-start pb-4">
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

            <p className="text-center text-sm text-muted-foreground mt-4">
              En vous connectant, vous acceptez nos{" "}
              <Link to="#" className="text-primary hover:underline">
                Conditions d'Utilisation
              </Link>
            </p>
          </form>
        </div>
      </CardContent>
      <BorderBeam duration={6} delay={3} size={400} borderWidth={2} />
    </Card>
  );
}
