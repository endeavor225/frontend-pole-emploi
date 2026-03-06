import { Link } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div className="space-y-3">
            <Logo className="scale-75 -ml-4 origin-left" />
            <p className="text-sm text-muted-foreground">
              Plateforme de mise en relation entre candidats et recruteurs en
              Côte d'Ivoire — Région de Ferkéssédougou.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Liens rapides</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/offres"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Offres d'emploi
              </Link>
              <Link
                to="/register/candidat"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Inscription candidat
              </Link>
              <Link
                to="/register/recruteur"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Inscription recruteur
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Contact</h4>
            <p className="text-sm text-muted-foreground">support@pajdef.com</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PAJDEF — Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
