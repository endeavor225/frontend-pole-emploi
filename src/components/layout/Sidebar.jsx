import { NavLink } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Settings,
  Building2,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/constants";

const candidatLinks = [
  { to: "/candidat/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/offres", icon: Briefcase, label: "Offres d'emploi" },
  { to: "/candidat/candidatures", icon: FileText, label: "Mes candidatures" },
  { to: "/candidat/favoris", icon: Heart, label: "Mes favoris" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/candidat/profil", icon: Settings, label: "Mon profil" },
];

const recruteurLinks = [
  { to: "/recruteur/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/recruteur/offres", icon: Briefcase, label: "Mes offres" },
  {
    to: "/recruteur/offres/nouvelle",
    icon: PlusCircle,
    label: "Nouvelle offre",
  },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/recruteur/profil", icon: Building2, label: "Mon entreprise" },
];

const adminLinks = [
  { to: "/candidat/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/offres", icon: Briefcase, label: "Offres" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  const links =
    user?.role === ROLES.RECRUTEUR
      ? recruteurLinks
      : user?.role === ROLES.ADMIN
        ? adminLinks
        : candidatLinks;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out",
        "md:sticky md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
