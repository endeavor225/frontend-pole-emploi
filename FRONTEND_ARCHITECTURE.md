# Plan d'Architecture et d'Intégration Frontend — PAJDEF

Ce document détaille l'architecture, l'UI/UX, l'intégration API, la sécurité et les bonnes pratiques pour le frontend Pôle Emploi (PAJDEF), en stricte cohérence avec le `PRD.md` du backend.

---

## 1. Architecture du Projet

### 1.1 Arborescence des Dossiers

Une architecture modulaire claire et évolutive pour séparer les responsabilités :

```text
src/
├── api/
│   ├── axios.js            # Configuration d'Axios (intercepteurs, tokens, baseURL)
│   ├── endpoints.js        # Constantes pour les URLs de l'API (ex: AUTH.LOGIN)
│   └── fetcher.js          # Fetcher basique SWR (fetcher = url => api.get(url).then(res => res.data))
├── components/
│   ├── ui/                 # Composants isolés shadcn/ui (Button, Input, Card...)
│   ├── shared/             # Composants globaux/réutilisables (LoadingSpinner, Navbar, Sidebar)
│   ├── forms/              # Composants contenant la logique Formik + Yup (ex: LoginForm)
│   └── cards/              # Composants d'affichage métiers (OffreCard, CandidatCard)
├── hooks/
│   ├── useAuth.js          # Hook combinant Zustand, API requests et redirections
│   ├── useOffres.js        # Hooks SWR pour isoler et abstraire la récupération des offres
│   └── useCandidatures.js  # Hooks SWR pour les candidatures
├── lib/
│   ├── constants.js        # Constantes métiers (Rôles, statuts, types d'offres)
│   └── utils.js            # Utilitaires génériques (cn pour Tailwind merge, formatage dates)
├── pages/
│   ├── public/             # Pages non-authentifiées (Accueil, Login, Register, OffresList)
│   ├── candidat/           # Espace Candidat (Dashboard, MesCandidatures, MonProfil)
│   ├── recruteur/          # Espace Recruteur (Dashboard, MesOffres, CréationOffre)
│   └── shared/             # Pages partagées après connexion (Notifications, Messages, Settings)
├── router/
│   ├── index.jsx           # Définition de l'arbre de routes avec React Router (createBrowserRouter)
│   └── ProtectedRoute.jsx  # Wrapper restrictif par rôles ou état de connexion
└── store/
    ├── authStore.js        # Store Zustand persistant (User details, Token, RefreshToken)
    └── uiStore.js          # Store Zustand (Mode sombre, état de la sidebar)
```

### 1.2 Routage (React Router)

- **Publique (Non-Auth / Auth Optionnelle)** : `/`, `/login`, `/register/candidat`, `/register/recruteur`, `/offres/:id`
- **Protégé (CANDIDAT)** : `/candidat/dashboard`, `/candidat/candidatures`, `/candidat/favoris`, `/candidat/profil`
- **Protégé (RECRUTEUR)** : `/recruteur/dashboard`, `/recruteur/offres`, `/recruteur/offres/nouvelle`, `/recruteur/profil`
- **Partagé (Auth requise)** : `/messages`, `/notifications`, `/settings`

### 1.3 Gestion d'État (Zustand) & API (Axios + SWR)

- **Zustand** : Utilisé _uniquement_ pour l'état persistant global, notamment l'authentification (`authStore` pour les tokens JWT sauvegardés dans le navigateur) et l'interface (`uiStore` pour le mode sombre).
- **SWR + Axios** : Utilisés pour 90% de la donnée métier asynchrone. Gère automatiquement le cache, le _stale-while-revalidate_, la pagination requise par Lucid et les refetch on focus.

---

## 2. UI/UX (Shadcn + TailwindCSS)

- **Authentification (Forms)** : Formulaires multi-étapes ou fractionnés avec validation Formik+Yup stricte. Affichage dans des `<Card>` centrées.
- **Offres (Liste & Filtres)** : Page publique (`/offres`). Une zone de filtres latérale affichant des `<Select>` (Domaine, Niveau) et une `<Input type="search">` pour le filtre ILIKE du backend (`?search=...`). Les offres sont listées en format grille.
- **Dashboards & CRUD** :
  - Utilisation de tableaux (`<Table>`) pour les candidatures (côté recruteur) et les offres créées.
  - Cartes de KPI/Statistiques (`<Card>`) sur l'accueil des dashboards (ex : total candidatures traitées, alertes non lues).
- **Notifications & Messagerie** :
  - Un badge rouge sur l'icône de cloche de la `Navbar` via un appel `useSWR('/api/notifications?lu=false')`.
  - Un drawer de chat partagé.

---

## 3. Sécurité et Permissions

1. **Tokens avec Axios** : Configuration d'un intercepteur Axios. Si le token est présent dans le `authStore` de Zustand, il est automatiquement injecté dans les headers : `Authorization: Bearer oat_...`.
2. **Refresh Token** : Un second intercepteur capture les erreurs HTTP `401 Unauthorized`. Il appelle `POST /auth/refresh-token`, met à jour Zustand avec le nouveau token, puis rejoue la requête initiale de façon transparente.
3. **Route Protection (`ProtectedRoute`)** :
   - Vérifie si l'utilisateur est connecté via le store Zustand. Si non, redirection de force vers `/login`.
   - Vérifie le rôle (ex: si `allowedRoles=['RECRUTEUR']` et que `user.role === 'CANDIDAT'`, redirection vers un composant `Unauthorized` ou `/` par défaut).

---

## 4. Performance et Bonnes Pratiques

- **Validation Formik+Yup** : Les règles définies dans le PRD (taille min, emails, password confirmed) seront validées côté client pour une UX fluide avant d'être soumises vers le backend (qui les revérifiera avec VineJS).
- **SWR Optimistic UI** : Lors d'actions légères comme le _toggle favoris_, l'UI met en scène un succès anticipé (`mutate` optimiste) avant que l'API réponde, supprimant les temps de latence au clic.
- **Chargement différé (Lazy Loading)** : Les espaces "Candidat" et "Recruteur" peuvent très bien être importés via `React.lazy()` afin de réduire la taille du bundle intial (split chunks).
- **Abstraction API SWR** : Les appels API avec SWR sont encapsulés dans des custom hooks tels que `useOffres(...)` au lieu d'intégrer l'appel en brut dans les composants vue. Cela centralise la logique asynchrone.

---

## 5. Exemples Concrets et Snippets Constructifs

Voici le socle d'intégration indispensable pour démarrer les implémentations sur le projet de façon modulaire et scalable :

### 5.1 Zustand Auth Store (`store/authStore.js`)

Gère l'injection des données du retour de login: `{ type: "bearer", token: "oat_...", refreshToken: "rat_...", user: {...} }`

```javascript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      logout: () => set({ user: null, token: null, refreshToken: null }),
    }),
    { name: "pajdef-auth" }, // sauvegarde silencieusement dans le localStorage
  ),
);
```

### 5.2 Intercepteurs Axios & Refresh Token (`api/axios.js`)

Ce fichier permet d'injecter la session automatiquement vers les requêtes API et intercepte les expirations du token Bearer.

```javascript
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: { "Content-Type": "application/json" },
});

// Ajouter le JWT bearer automatiquement s'il existe
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interception des 401 pour le Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // Si on a un 401 et qu'on n'a pas encore essayé de rafraîchir
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      authStore.refreshToken
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {
            refreshToken: authStore.refreshToken,
          },
        );

        // Le backend renvoie les nouveaux tokens
        authStore.setAuth(authStore.user, data.token, data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        return api(originalRequest); // Rejoue la requête originale
      } catch (err) {
        // Refresh token expiré ou erroné : déconnexion forcée
        authStore.logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

### 5.3 Abstraction Hook SWR (`hooks/useOffres.js`)

Pour consommer proprement l'endpoint paginé `GET /api/offres`.

```javascript
import useSWR from "swr";
import { fetcher } from "@/api/fetcher";

export function useOffres(filters = {}) {
  // Construction des requêtes search, type, limites...
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const queryString = params.toString();
  const endpoint = `/offres${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);

  return {
    offres: data?.data || [], // S'adapte au format de réponse paginée Lucid
    meta: data?.meta,
    isLoading,
    isError: error,
    mutate,
  };
}
```

### 5.4 Formulaire avec Formik, Yup et shadcn (`components/forms/LoginForm.jsx`)

Exemple fonctionnel croisant : shadcn `<Input/Label/Button>`, Formik pour la gestion d'état, Yup pour la validation PRD stricte, et l'API Axios.

```javascript
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/api/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Format d'email invalide")
    .required("Email obligatoire"),
  password: Yup.string()
    .min(8, "Minimum 8 caractères requis")
    .required("Mot de passe obligatoire"),
});

export function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await api.post("/auth/login", values);

        // Destructuration de la réponse Pôle Emploi (cf. PRD)
        const { token, refreshToken, user } = response.data;
        setAuth(user, token, refreshToken);

        toast.success(`Bienvenue ${user.prenom || user.nomEntreprise || ""}`);

        // Routage conditionnel selon rôle
        if (user.role === "CANDIDAT") navigate("/candidat/dashboard");
        else if (user.role === "RECRUTEUR") navigate("/recruteur/dashboard");
        else navigate("/");
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur de connexion");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="exemple@email.com"
          {...formik.getFieldProps("email")}
          className={
            formik.touched.email && formik.errors.email
              ? "border-destructive"
              : ""
          }
          disabled={formik.isSubmitting}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-xs text-destructive">{formik.errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <a
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          {...formik.getFieldProps("password")}
          className={
            formik.touched.password && formik.errors.password
              ? "border-destructive"
              : ""
          }
          disabled={formik.isSubmitting}
        />
        {formik.touched.password && formik.errors.password && (
          <p className="text-xs text-destructive">{formik.errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en
            cours...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
}
```

### 5.5 Validation des Données (Formik + Yup) — Schémas Complets d'Exemple

Pour répondre aux règles métier du `PRD.md`, voici les schémas de validation Yup prêts à être intégrés dans les formulaires d'inscription et de création d'offres :

#### A. Schéma d'Inscription Candidat (`RegisterCandidatPage`)

Valide les contraintes de longueurs, formats de dates, tailles de fichiers (si gérés côté front), et l'obligation des champs.

```javascript
export const candidatValidationSchema = Yup.object().shape({
  nom: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(80, "Maximum 80 caractères")
    .required("Nom obligatoire"),
  prenom: Yup.string()
    .min(3, "Minimum 3 caractères")
    .max(80, "Maximum 80 caractères")
    .required("Prénom obligatoire"),
  email: Yup.string()
    .email("Format d'email invalide")
    .required("Email obligatoire"),
  password: Yup.string()
    .min(8, "Minimum 8 caractères requis")
    .required("Mot de passe obligatoire"),
  password_confirmation: Yup.string()
    .oneOf(
      [Yup.ref("password"), null],
      "Les mots de passe ne correspondent pas",
    )
    .required("Confirmation obligatoire"),
  telephone: Yup.string()
    .min(10, "Minimum 10 chiffres")
    .max(15, "Maximum 15 chiffres")
    .required("Téléphone obligatoire"),
  experience: Yup.number()
    .min(0, "L'expérience ne peut être négative")
    .required("Années d'expérience obligatoires"),
  niveauEtudeId: Yup.string()
    .uuid("Veuillez sélectionner un niveau")
    .required("Niveau d'étude obligatoire"),
  domaineId: Yup.string()
    .uuid("Veuillez sélectionner un domaine")
    .required("Domaine obligatoire"),
  sexe: Yup.string()
    .oneOf(["masculin", "feminin"], "Sexe invalide")
    .required("Sexe obligatoire"),
  etatCivil: Yup.string().required("État civil obligatoire"),
  ville: Yup.string().required("Ville obligatoire"),
  dateNaissance: Yup.date()
    .max(new Date(), "La date de naissance ne peut être dans le futur")
    .required("Date de naissance obligatoire"),
  // Note: La validation des fichiers (2MB, 5MB, JPG/PDF) se fait souvent dans la fonction onChange de l'input file
  // ou via un test formik personnalisé (`.test("fileSize", ...)`)
});
```

#### B. Schéma d'Inscription Recruteur (`RegisterRecruteurPage`)

```javascript
export const recruteurValidationSchema = Yup.object().shape({
  nom: Yup.string().required("Nom obligatoire"),
  prenom: Yup.string().required("Prénom obligatoire"),
  email: Yup.string().email("Format invalide").required("Email obligatoire"),
  password: Yup.string()
    .min(8, "Minimum 8 caractères")
    .required("Mot de passe obligatoire"),
  nomEntreprise: Yup.string().required("Nom de l'entreprise obligatoire"),
  description: Yup.string().required("Description de l'entreprise obligatoire"),
  telephone: Yup.string().required("Téléphone obligatoire"),
  domaineId: Yup.string()
    .uuid("Sélection invalide")
    .required("Domaine d'activité obligatoire"),
  adresse: Yup.string().required("Adresse obligatoire"),
  ville: Yup.string().required("Ville obligatoire"),
  pays: Yup.string().required("Pays obligatoire"),
  civilite: Yup.string().required("Civilité obligatoire"),
  codePostal: Yup.string().optional(),
  siteWeb: Yup.string()
    .url("URL invalide (ex: https://monsite.com)")
    .optional(),
});
```

#### C. Schéma Création d'Offre (`NouvelleOffrePage`)

Gère particulièrement la validation des listes (array > 0).

```javascript
export const offreValidationSchema = Yup.object().shape({
  titre: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(150, "Maximum 150 caractères")
    .required("Titre obligatoire"),
  description: Yup.string().required("Description obligatoire"),
  experienceMin: Yup.number()
    .min(0, "Ne peut être négatif")
    .required("Expérience minimum requise"),
  salaireMin: Yup.number()
    .min(0, "Ne peut être négatif")
    .required("Salaire minimum requis"),
  salaireMax: Yup.number()
    .min(
      Yup.ref("salaireMin"),
      "Doit être supérieur ou égal au salaire minimum",
    )
    .optional(),
  type_offre: Yup.string()
    .oneOf(
      ["Emploi", "Stage", "Interim", "Freelance", "Consultance"],
      "Type d'offre invalide",
    )
    .required("Type d'offre obligatoire"),
  localisation: Yup.string().required("Localisation obligatoire"),
  dateLimite: Yup.date()
    .min(new Date(), "La date limite doit être dans le futur")
    .required("Date limite obligatoire"),
  niveauxEtudeIds: Yup.array()
    .of(Yup.string().uuid())
    .min(1, "Sélectionnez au moins un niveau d'étude")
    .required(),
  domaineIds: Yup.array()
    .of(Yup.string().uuid())
    .min(1, "Sélectionnez au moins un domaine")
    .required(),
});
```
