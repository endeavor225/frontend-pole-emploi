import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound, Loader2, Eye, EyeOff, XCircle } from "lucide-react";

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmation) {
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password, confirmation);
    } catch {
      // Handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-[580px] border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl text-center">
        <CardHeader className="pb-6 pt-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-destructive">
            Lien invalide
          </CardTitle>
          <CardDescription className="pt-2 font-medium">
            Ce lien de réinitialisation est invalide ou a expiré.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pb-8">
          <Button asChild className="h-11 px-8">
            <Link to="/forgot-password">Demander un nouveau lien</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[580px] border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl">
      <CardHeader className="text-center pb-6 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          Nouveau mot de passe
        </CardTitle>
        <CardDescription className="pt-2 font-medium">
          Choisissez un nouveau mot de passe sécurisé
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                className="h-10 border-border bg-muted/50 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirmer le mot de passe *</Label>
            <Input
              id="confirmation"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              className={`h-10 border-border bg-muted/50 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 ${
                password && confirmation && password !== confirmation ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            {password && confirmation && password !== confirmation && (
              <p className="text-xs text-destructive">
                Les mots de passe ne correspondent pas
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="pb-8 pt-4">
          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading || password !== confirmation || !password}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                Réinitialisation…
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
