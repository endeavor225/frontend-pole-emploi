import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import { AUTH } from "@/api/endpoints";
import { Logo } from "@/components/shared/Logo";
import { toast } from "sonner";

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout: clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleSidebar, theme, toggleTheme } = useUiStore();
  /* ✅ Toujours appelé (règles des hooks), mais fetch désactivé si non authentifié */
  const { unreadCount: _unreadCount } = useNotifications(isAuthenticated);
  const unreadCount = isAuthenticated ? _unreadCount : 0;

  const handleLogout = async () => {
    try {
      await api.post(AUTH.LOGOUT);
    } catch {
      // Logout même si l'API échoue
    } finally {
      clearAuth();
      toast.success("Déconnexion réussie");
    }
  };

  const getInitials = (user) => {
    if (!user) return "?";
    const nom = user.nom || "";
    const prenom = user.prenom || "";
    return (
      `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase() || "?"
    );
  };

  const profilePath =
    user?.role === "RECRUTEUR" ? "/recruteur/profil" : "/candidat/profil";

  const dashboardPath =
    user?.role === "RECRUTEUR" ? "/recruteur/dashboard" : "/candidat/dashboard";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-(--cream) text-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl px-8 mx-auto w-full">
          {/* Top section (Logo + Mobile controls) */}
          <div className="flex items-center justify-between py-3 md:py-6 w-full md:w-auto">
            {/* Logo */}
            <Link
              to="/"
              className="text-lg relative z-50 font-bold tracking-widest rounded-lg focus:outline-none"
            >
              <Logo />
            </Link>

            {/* Mobile right: Bell + Avatar (si connecté) + Hamburger */}
            <div className="flex items-center gap-3 md:hidden">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate("/notifications")}
                    className="relative focus:outline-none hover:text-primary transition-colors p-1"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <Avatar
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => navigate(dashboardPath)}
                  >
                    <AvatarFallback className="bg-primary text-white text-xs font-bold">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </>
              )}
              <button
                className="focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className={`
              flex flex-col md:flex-row md:items-center md:justify-end
              w-full md:w-auto
              overflow-hidden md:overflow-visible
              transition-all duration-500 ease-in-out 

              ${
                mobileMenuOpen
                  ? "max-h-[600px] opacity-100 translate-y-0 pb-4 md:pb-0"
                  : "max-h-0 opacity-0 -translate-y-2 md:max-h-none md:opacity-100 md:translate-y-0"
              }
            `}
          >
            <Link
              to="/"
              className="px-4 py-2 mt-2 md:mt-0 text-sm bg-transparent rounded-lg md:ml-2 focus:outline-none hover:text-foreground/70"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>

            <Link
              to="/offres"
              className="px-2 py-2 mt-2 md:mt-0 text-sm bg-transparent rounded-lg md:ml-2 focus:outline-none hover:text-foreground/70"
              onClick={() => setMobileMenuOpen(false)}
            >
              Offres d'emploi
            </Link>

            <Link
              to="/entreprises"
              className="px-2 py-2 mt-2 md:mt-0 text-sm bg-transparent rounded-lg md:ml-2 focus:outline-none hover:text-foreground/70"
              onClick={() => setMobileMenuOpen(false)}
            >
              Entreprises
            </Link>

            <Link
              to="/a-propos"
              className="px-2 py-2 mt-2 md:mt-0 text-sm bg-transparent rounded-lg md:ml-2 focus:outline-none hover:text-foreground/70"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </Link>

            {/* Theme toggle */}
            {/* <button
              onClick={toggleTheme}
              className="hidden lg:flex ml-4 lg:mt-0 focus:outline-none items-center justify-center p-2"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 hover:text-primary transition-colors" />
              ) : (
                <Sun className="h-5 w-5 hover:text-primary transition-colors" />
              )}
              <span className="sr-only">Thème</span>
            </button> */}

            {/* ── Auth Desktop (Bell + Avatar) ── */}
            {isAuthenticated ? (
              <>
                {/* Desktop seulement : Bell + Avatar dropdown */}
                <div className="hidden md:flex items-center gap-3 ml-4">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="relative focus:outline-none hover:text-primary transition-colors p-1"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notifications</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative h-9 w-9 rounded-full focus:outline-none hover:scale-101 transition-transform">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary text-white text-xs font-bold">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">
                          {user?.prenom} {user?.nom}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                        <Badge variant="outline" className="w-fit text-xs mt-1">
                          {user?.role}
                        </Badge>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(profilePath)}>
                        <User className="mr-2 h-4 w-4" /> Mon profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/settings")}>
                        <Settings className="mr-2 h-4 w-4" /> Paramètres
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive font-medium"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile seulement : liens inline */}
                <div className="flex flex-col md:hidden border-t border-border mt-3 pt-3 space-y-1">
                  <p className="text-xs text-muted-foreground px-2 pb-1 font-medium">
                    {user?.prenom} {user?.nom} · {user?.role}
                  </p>
                  <button
                    onClick={() => {
                      navigate(dashboardPath);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50 text-left"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate(profilePath);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50 text-left"
                  >
                    <User className="w-4 h-4" /> Mon profil
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50 text-left"
                  >
                    <Settings className="w-4 h-4" /> Paramètres
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted/50 text-destructive font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </>
            ) : (
              /* Non authentifié : boutons plein-largeur mobile */
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 md:mt-0 md:ml-4 pt-4 md:pt-0 border-t border-border md:border-0">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm font-medium text-center bg-white hover:bg-white/80 text-gray-800 rounded-full shadow-sm transition-all focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register/candidat"
                  className="px-6 py-2.5 text-sm font-medium text-center bg-primary hover:bg-primary/90 text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
