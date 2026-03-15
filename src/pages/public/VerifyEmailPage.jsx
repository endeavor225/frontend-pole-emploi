import { MailCheck } from "lucide-react";
import { VerifyEmailForm } from "@/components/features/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full items-center bg-slate-50/50 dark:bg-background">
      <div className="container mx-auto grid w-full grid-cols-1 gap-12 px-4 py-12 lg:grid-cols-2 lg:gap-8 lg:px-8 xl:gap-24">
        {/* Colonne Gauche : Branding */}
        <div className="flex flex-col justify-center space-y-10 lg:py-12 order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <MailCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold uppercase tracking-wider text-foreground">
              TALENTS
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Validation <br className="hidden lg:block xl:hidden" /> de contact.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Nous vérifions votre adresse email. Cette étape est cruciale pour sécuriser votre compte et garantir que vous recevrez toutes vos opportunités.
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
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
}
