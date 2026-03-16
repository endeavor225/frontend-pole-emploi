import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ROLES } from "@/lib/constants";

// ========================
// Lazy-loaded pages
// ========================

// Public
const HomePage = lazy(() => import("@/pages/public/HomePage"));
const AboutPage = lazy(() => import("@/pages/public/AboutPage"));
const NotFoundPage = lazy(() => import("@/pages/public/NotFoundPage"));
const OffresPage = lazy(() => import("@/pages/public/OffresPage"));
const OffreDetailPage = lazy(() => import("@/pages/public/OffreDetailPage"));
const EntreprisesPage = lazy(() => import("@/pages/public/EntreprisesPage"));
const EntrepriseDetailPage = lazy(
  () => import("@/pages/public/EntrepriseDetailPage"),
);
const LoginPage = lazy(() => import("@/pages/public/LoginPage"));
const RegisterCandidatPage = lazy(
  () => import("@/pages/public/RegisterCandidatPage"),
);
const RegisterRecruteurPage = lazy(
  () => import("@/pages/public/RegisterRecruteurPage"),
);
const ForgotPasswordPage = lazy(
  () => import("@/pages/public/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@/pages/public/ResetPasswordPage"),
);
const VerifyEmailPage = lazy(() => import("@/pages/public/VerifyEmailPage"));
const CGUPage = lazy(() => import("@/pages/public/CGUPage"));

// Candidat
const CandidatDashboard = lazy(() => import("@/pages/candidat/DashboardPage"));
const MesCandidatures = lazy(
  () => import("@/pages/candidat/MesCandidaturesPage"),
);
const MesFavoris = lazy(() => import("@/pages/candidat/MesFavorisPage"));
const MonProfil = lazy(() => import("@/pages/candidat/MonProfilPage"));

// Recruteur
const RecruteurDashboard = lazy(
  () => import("@/pages/recruteur/DashboardPage"),
);
const MesOffres = lazy(() => import("@/pages/recruteur/MesOffresPage"));
const NouvelleOffre = lazy(() => import("@/pages/recruteur/NouvelleOffrePage"));
const ModifierOffre = lazy(() => import("@/pages/recruteur/ModifierOffrePage"));
const CandidaturesOffre = lazy(
  () => import("@/pages/recruteur/CandidaturesOffrePage"),
);
const ProfilEntreprise = lazy(
  () => import("@/pages/recruteur/ProfilEntreprisePage"),
);

// Shared (auth required)
const Notifications = lazy(() => import("@/pages/shared/NotificationsPage"));
const Messages = lazy(() => import("@/pages/shared/MessagesPage"));
const Conversation = lazy(() => import("@/pages/shared/ConversationPage"));
const Settings = lazy(() => import("@/pages/shared/SettingsPage"));

// ========================
// Suspense wrapper
// ========================
function Lazy({ children }) {
  return (
    <Suspense fallback={<LoadingSpinner text="Chargement…" />}>
      {children}
    </Suspense>
  );
}

// ========================
// Router
// ========================
export const router = createBrowserRouter([
  // ---- Public layout ----
  {
    element: <PublicLayout />,
    errorElement: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
    children: [
      {
        path: "/",
        element: (
          <Lazy>
            <HomePage />
          </Lazy>
        ),
      },
      {
        path: "/a-propos",
        element: (
          <Lazy>
            <AboutPage />
          </Lazy>
        ),
      },
      {
        path: "/offres",
        element: (
          <Lazy>
            <OffresPage />
          </Lazy>
        ),
      },
      {
        path: "/offres/:id",
        element: (
          <Lazy>
            <OffreDetailPage />
          </Lazy>
        ),
      },
      {
        path: "/entreprises",
        element: (
          <Lazy>
            <EntreprisesPage />
          </Lazy>
        ),
      },
      {
        path: "/entreprises/:id",
        element: (
          <Lazy>
            <EntrepriseDetailPage />
          </Lazy>
        ),
      },
      {
        path: "/login",
        element: (
          <Lazy>
            <LoginPage />
          </Lazy>
        ),
      },
      {
        path: "/register/candidat",
        element: (
          <Lazy>
            <RegisterCandidatPage />
          </Lazy>
        ),
      },
      {
        path: "/register/recruteur",
        element: (
          <Lazy>
            <RegisterRecruteurPage />
          </Lazy>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <Lazy>
            <ForgotPasswordPage />
          </Lazy>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <Lazy>
            <ResetPasswordPage />
          </Lazy>
        ),
      },
      {
        path: "/verify-email",
        element: (
          <Lazy>
            <VerifyEmailPage />
          </Lazy>
        ),
      },
      {
        path: "/cgu",
        element: (
          <Lazy>
            <CGUPage />
          </Lazy>
        ),
      },
    ],
  },

  // ---- Dashboard layout (auth required) ----
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
    children: [
      // Candidat
      {
        path: "/candidat/dashboard",
        element: (
          <RoleRoute roles={[ROLES.CANDIDAT, ROLES.ADMIN]}>
            <Lazy>
              <CandidatDashboard />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/candidat/candidatures",
        element: (
          <RoleRoute roles={[ROLES.CANDIDAT]}>
            <Lazy>
              <MesCandidatures />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/candidat/favoris",
        element: (
          <RoleRoute roles={[ROLES.CANDIDAT]}>
            <Lazy>
              <MesFavoris />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/candidat/profil",
        element: (
          <RoleRoute roles={[ROLES.CANDIDAT, ROLES.ADMIN]}>
            <Lazy>
              <MonProfil />
            </Lazy>
          </RoleRoute>
        ),
      },

      // Recruteur
      {
        path: "/recruteur/dashboard",
        element: (
          <RoleRoute roles={[ROLES.RECRUTEUR, ROLES.ADMIN]}>
            <Lazy>
              <RecruteurDashboard />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/recruteur/offres",
        element: (
          <RoleRoute roles={[ROLES.RECRUTEUR]}>
            <Lazy>
              <MesOffres />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/recruteur/offres/nouvelle",
        element: (
          <RoleRoute roles={[ROLES.RECRUTEUR]}>
            <Lazy>
              <NouvelleOffre />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/recruteur/offres/:id/modifier",
        element: (
          <RoleRoute roles={[ROLES.RECRUTEUR]}>
            <Lazy>
              <ModifierOffre />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/recruteur/offres/:id/candidatures",
        element: (
          <RoleRoute roles={[ROLES.RECRUTEUR]}>
            <Lazy>
              <CandidaturesOffre />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: "/recruteur/profil",
        element: (
          <RoleRoute roles={[ROLES.RECRUTEUR, ROLES.ADMIN]}>
            <Lazy>
              <ProfilEntreprise />
            </Lazy>
          </RoleRoute>
        ),
      },

      // Shared
      {
        path: "/notifications",
        element: (
          <Lazy>
            <Notifications />
          </Lazy>
        ),
      },
      {
        path: "/messages",
        element: (
          <Lazy>
            <Messages />
          </Lazy>
        ),
      },
      {
        path: "/messages/:userId",
        element: (
          <Lazy>
            <Conversation />
          </Lazy>
        ),
      },
      {
        path: "/settings",
        element: (
          <Lazy>
            <Settings />
          </Lazy>
        ),
      },
      {
        path: "*",
        element: (
          <Lazy>
            <NotFoundPage />
          </Lazy>
        ),
      },
    ],
  },
]);
