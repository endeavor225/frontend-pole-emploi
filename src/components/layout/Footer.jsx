import { Link } from "react-router-dom";
import logoImg from "/logo.png";

export function Footer() {
  return (
    <footer className="bg-[#252641] text-[#B2B3CF]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div className="space-y-3">
            <div className="opacity-90 inline-block">
              <img src={logoImg} alt="PAJDEF Logo" className="h-10 w-auto" />
            </div>
            <p className="text-sm">
              Plateforme de mise en relation entre candidats et recruteurs en
              Côte d'Ivoire — Département de Ferkéssédougou.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Liens rapides</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/offres"
                className="text-sm hover:text-white transition-colors"
              >
                Offres d'emploi
              </Link>
              <Link
                to="/register/candidat"
                className="text-sm hover:text-white transition-colors"
              >
                Inscription candidat
              </Link>
              <Link
                to="/register/recruteur"
                className="text-sm hover:text-white transition-colors"
              >
                Inscription recruteur
              </Link>
              <Link
                to="/cgu"
                className="text-sm hover:text-white transition-colors"
              >
                Conditions Générales d'Utilisation
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <p className="text-sm">support@pajdef.com</p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-xs">
            © {new Date().getFullYear()} PAJDEF — Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
