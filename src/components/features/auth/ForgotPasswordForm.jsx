import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // Handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[580px] border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl">
      <CardHeader className="text-center pb-6 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          {sent ? (
            <CheckCircle2 className="h-7 w-7 text-chart-2" />
          ) : (
            <Mail className="h-7 w-7 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          {sent ? "Email envoyé !" : "Mot de passe oublié"}
        </CardTitle>
        <CardDescription className="pt-2 font-medium">
          {sent
            ? `Un lien de réinitialisation a été envoyé à ${email}`
            : "Entrez votre email pour recevoir un lien de réinitialisation"}
        </CardDescription>
      </CardHeader>

      {!sent ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="h-10 border-border bg-muted/50 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-6">
            <Button
              type="submit"
              className="w-full mt-2 h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi…
                </>
              ) : (
                "Envoyer le lien"
              )}
            </Button>
            <Link
              to="/login"
              className="flex items-center justify-center w-full gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
          </CardFooter>
        </form>
      ) : (
        <CardFooter className="flex flex-col gap-4 pb-8">
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => setSent(false)}
          >
            Renvoyer un email
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center w-full gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
