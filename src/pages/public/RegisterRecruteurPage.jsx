import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";
import { Building2 } from "lucide-react";
import { RegisterRecruteurForm } from "@/components/features/auth/RegisterRecruteurForm";

export default function RegisterRecruteurPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fetch domaines
  const { data: domainesData } = useSWR("/domaines", fetcher);
  const domaines = domainesData?.data || domainesData || [];

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-center bg-slate-50/50 dark:bg-background">
      <div className="container mx-auto grid w-full grid-cols-1 gap-12 px-4 py-12 lg:grid-cols-2 lg:gap-8 lg:px-8 xl:gap-24">
        {/* Colonne Gauche : Branding */}
        <div className="flex flex-col justify-center space-y-10 lg:py-12 order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold uppercase tracking-wider text-foreground">
              ENTREPRISES
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Développez votre <br className="hidden lg:block xl:hidden" />{" "}
              équipe.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Accédez à notre vivier de talents. Publiez vos offres et gérez vos
              recrutements avec simplicité et efficacité.
            </p>
          </div>

          <div className="grid max-w-sm grid-cols-2 gap-8 border-t border-border pt-8">
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                500+
              </p>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Entreprises
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                24/7
              </p>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Support
              </p>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire */}
        <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">
          <RegisterRecruteurForm domaines={domaines} />
        </div>
      </div>
    </div>
  );
}
