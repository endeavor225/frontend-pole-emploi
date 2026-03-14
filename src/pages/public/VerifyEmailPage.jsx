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

export default function VerifyEmailPage() {
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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
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
          <CardTitle className="text-2xl">
            {status === "loading" && "Vérification en cours…"}
            {status === "success" && "Email vérifié !"}
            {status === "error" && "Échec de la vérification"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>

        <CardFooter className="justify-center">
          {status !== "loading" && (
            <Button asChild>
              <Link to="/login">
                {status === "success"
                  ? "Se connecter"
                  : "Retour à la connexion"}
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
