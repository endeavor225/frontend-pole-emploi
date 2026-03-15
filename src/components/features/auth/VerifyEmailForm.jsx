import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyEmailForm() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Aucun token de vérification trouvé.");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Votre adresse email a été vérifiée avec succès !");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Le lien de vérification est invalide ou a expiré.",
        );
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <Card className="w-full max-w-[580px] border-0 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:rounded-3xl text-center">
      <CardHeader className="pb-6 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          {status === "loading" && (
            <div className="bg-primary/10 rounded-full h-full w-full flex items-center justify-center">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="bg-chart-2/10 rounded-full h-full w-full flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-chart-2" />
            </div>
          )}
          {status === "error" && (
            <div className="bg-destructive/10 rounded-full h-full w-full flex items-center justify-center">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          {status === "loading" && "Vérification en cours…"}
          {status === "success" && "Email vérifié !"}
          {status === "error" && "Échec de la vérification"}
        </CardTitle>
        <CardDescription className="pt-2 font-medium">{message}</CardDescription>
      </CardHeader>

      <CardFooter className="justify-center pb-8">
        {status !== "loading" && (
          <Button asChild className="h-11 px-8">
            <Link to="/login">
              {status === "success"
                ? "Se connecter"
                : "Retour à la connexion"}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
