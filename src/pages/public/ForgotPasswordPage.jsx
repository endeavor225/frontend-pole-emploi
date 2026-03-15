import { KeyRound } from "lucide-react";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-center bg-slate-50/50 dark:bg-background">
      <div className="container mx-auto grid w-full grid-cols-1 gap-12 px-4 py-12 lg:grid-cols-2 lg:gap-8 lg:px-8 xl:gap-24">
        {/* Colonne Gauche : Branding */}
        <div className="flex flex-col justify-center space-y-10 lg:py-12 order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold uppercase tracking-wider text-foreground">
              TALENTS
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Récupérez votre <br className="hidden lg:block xl:hidden" /> accès.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Ne perdez pas le contact avec vos opportunités. Réinitialisez votre mot de passe en toute sécurité de manière simple et rapide.
            </p>
          </div>

          <div className="grid max-w-sm grid-cols-2 gap-8 border-t border-border pt-8">
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                10k+
              </p>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Utilisateurs
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-foreground">
                99.9%
              </p>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Uptime
              </p>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire */}
        <div className="flex items-center justify-center lg:justify-end order-1 lg:order-2">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
