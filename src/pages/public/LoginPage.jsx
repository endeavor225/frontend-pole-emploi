import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LogIn, UserPlus, Building2, ChevronRight } from "lucide-react";
import { LoginForm } from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const from = location.state?.from || null;

  /* Redirection si déjà connecté — respecte le rôle ou from */
  if (isAuthenticated) {
    const to =
      from ||
      (user?.role === "RECRUTEUR"
        ? "/recruteur/dashboard"
        : "/candidat/dashboard");
    return <Navigate to={to} replace />;
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-center bg-slate-50/50 dark:bg-background">
      <div className="container mx-auto grid w-full grid-cols-1 gap-12 px-4 py-10 lg:grid-cols-2 lg:gap-8 lg:px-8 xl:gap-24">
        {/* Colonne Gauche : Branding */}
        <div className="flex flex-col justify-center space-y-6 lg:py-8 order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold uppercase tracking-wider text-foreground">
              TALENTS
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Bon retour <br className="hidden lg:block xl:hidden" /> parmi
              nous.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Connectez-vous pour continuer à bénéficier de nos outils de
              recherche rapides et de la puissance de notre réseau de plus de 1
              000 recruteurs actifs.
            </p>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs shadow-sm"
                >
                  {i === 1 ? "👨‍💻" : i === 2 ? "👩‍💼" : "🧑‍🎨"}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Rejoignez plus de 10 000 professionnels.
            </p>
          </div>

          {/* Section "Pas encore de compte ?" Repensée */}
          <div className="border-t border-border pt-8 mt-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
              Pas encore de compte ?
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
              <Link
                to="/register/candidat"
                className="group flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-foreground">
                    Candidat
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Rechercher un emploi</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>

              <Link
                to="/register/recruteur"
                className="group flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-foreground">
                    Recruteur
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Publier une offre</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire */}
        <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
