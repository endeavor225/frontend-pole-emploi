import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="bg-primary/10 size-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-primary">
          <FileQuestion className="size-12" />
        </div>

        <h1 className="text-6xl font-black text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Oups ! Page introuvable
        </h2>

        <p className="text-muted-foreground mb-8 text-lg">
          {error?.statusText ||
            error?.message ||
            "La page que vous recherchez semble avoir disparu ou n'a jamais existé."}
        </p>

        <Button asChild size="lg" className="rounded-full shadow-lg font-bold">
          <Link to="/">
            <Home className="mr-2 size-5" />
            Retour à l'accueil
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
