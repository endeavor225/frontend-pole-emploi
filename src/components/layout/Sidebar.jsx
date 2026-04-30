import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  User,
  Briefcase,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  FileText,
  PlusCircle,
  Building2,
  Pencil,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { API_BASE, cn } from "@/lib/utils";
import { ROLES } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/api/axios";
import { AUTH } from "@/api/endpoints";
import { toast } from "sonner";

/* ── Liens candidat ── */
const candidatLinks = [
  {
    to: "/candidat/dashboard",
    icon: Home,
    label: "Espace candidat",
    end: true,
  },
  { to: "/candidat/profil", icon: User, label: "Page Personnelle" },
  { to: "/candidat/candidatures", icon: FileText, label: "Mes candidatures" },
  { to: "/candidat/favoris", icon: Heart, label: "Mes favoris" },
  { to: "/settings", icon: Settings, label: "Mes paramètres" },
];

/* ── Liens recruteur ── */
const recruteurLinks = [
  {
    to: "/recruteur/dashboard",
    icon: Home,
    label: "Espace recruteur",
    end: true,
  },
  { to: "/recruteur/profil", icon: Building2, label: "Mon entreprise" },
  { to: "/recruteur/offres", icon: Briefcase, label: "Mes offres", end: true },
  {
    to: "/recruteur/offres/nouvelle",
    icon: PlusCircle,
    label: "Nouvelle offre",
  },
  { to: "/settings", icon: Settings, label: "Mes paramètres" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout: clearAuth } = useAuthStore();

  const isCandidat = user?.role === ROLES.CANDIDAT;
  const isRecruteur = user?.role === ROLES.RECRUTEUR;

  const links = isRecruteur ? recruteurLinks : candidatLinks;

  const profilePath = isRecruteur ? "/recruteur/profil" : "/candidat/profil";

  /* Initiales de secours */
  const initials =
    `${user?.prenom?.charAt(0) || ""}${user?.nom?.charAt(0) || ""}`.toUpperCase() ||
    "?";

  /* Photo */
  const photoUrl = isCandidat
    ? user?.candidat?.photoPath
      ? `${API_BASE}${user.candidat.photoPath}`
      : null
    : isRecruteur
      ? user?.entreprise?.logoPath
        ? `${API_BASE}${user.entreprise.logoPath}`
        : null
      : null;

  /* Infos profil candidat */
  const experienceMin = user?.candidat?.experienceMin ?? null;
  const niveauEtude =
    user?.candidat?.niveauEtude?.libelle ??
    user?.candidat?.niveauEtudeLibelle ??
    null;

  /* Nom affiché */
  const nomComplet = [user?.prenom, user?.nom]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
  const entrepriseName = user?.entreprise?.nomEntreprise ?? null;

  const handleLogout = async () => {
    try {
      await api.post(AUTH.LOGOUT);
    } catch {
      /* ignore */
    } finally {
      clearAuth();
      toast.success("Déconnexion réussie");
      navigate("/login");
    }
  };

  return (
    <aside className="w-full md:w-85 shrink-0 space-y-4">
      {/* ── Card profil ── */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {/* Photo + Edit */}
        <div className="relative flex justify-center pt-6 pb-4">
          <div className="relative">
            <Avatar className="h-24 w-24 rounded-xl border-2 border-border shadow">
              {photoUrl && (
                <AvatarImage
                  src={photoUrl}
                  alt={nomComplet}
                  className="object-cover object-top"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Bouton Modifier */}
            <button
              onClick={() => navigate(profilePath)}
              className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-1 shadow-sm hover:bg-muted transition-colors"
              title="Modifier le profil"
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Infos utilisateur */}
        <div className="text-center px-4 pb-5 space-y-1">
          <p className="text-sm font-extrabold text-primary leading-tight">
            {nomComplet}
          </p>

          {isRecruteur && entrepriseName && (
            <p className="text-xs text-muted-foreground font-medium">
              {entrepriseName}
            </p>
          )}

          {isCandidat && (
            <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
              {experienceMin != null && (
                <p>
                  Années d&apos;expériences :{" "}
                  <span className="text-primary font-semibold">
                    {experienceMin} an{experienceMin > 1 ? "s" : ""}
                  </span>
                </p>
              )}
              {niveauEtude && (
                <p>
                  Niveau d&apos;études :{" "}
                  <span className="text-primary font-semibold">
                    {niveauEtude}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <nav className="flex flex-col">
          {links.map(({ to, icon: Icon, label, end }, idx) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors border-b border-border/30 last:border-b-0",
                  idx === 0 && "rounded-t-2xl",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted/60",
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}

          {/* Aide */}
          <button className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors border-t border-border/30 w-full text-left">
            <HelpCircle className="w-4 h-4 shrink-0" />
            Aide / Questions
          </button>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors rounded-b-2xl w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Se déconnecter
          </button>
        </nav>
      </div>
    </aside>
  );
}
