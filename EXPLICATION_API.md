# Gestion des API dans PAJDEF

Ce document explique la stratégie globale de communication avec le backend (API REST) et la gestion de l'état asynchrone dans l'application React **PAJDEF**.

Notre architecture repose sur trois piliers distincts qui travaillent en synergie :

1. **Zustand** (pour l'état global et persistant)
2. **SWR** (pour la récupération de données et le cache)
3. **Axios** (pour la configuration réseau commune)

---

## 🐻 1. Zustand : L'État Global et l'Authentification

Zustand est une bibliothèque de gestion d'état _(State Management)_ très légère, minimaliste et performante.

### Son Rôle dans l'Application

Nous l'utilisons pour gérer l'état d'Authentification (`isAuthenticated`), le profil de l'utilisateur (`user`), et les Tokens (JWT).

### Exemple d'implémentation (Le Store)

```javascript
// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      // État initial
      isAuthenticated: false,
      user: null,
      accessToken: null,

      // Actions pour modifier l'état
      setAuth: (user, accessToken) =>
        set({
          isAuthenticated: true,
          user,
          accessToken,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
        }),
    }),
    {
      name: "pajdef-auth", // Sauvegarde automatique dans le LocalStorage
    },
  ),
);
```

**Comment l'utiliser dans un composant ?**

```javascript
// Dans la Navbar par exemple
import { useAuthStore } from "@/store/authStore";

function Navbar() {
  // On récupère juste ce dont on a besoin :
  const { user, isAuthenticated, logout } = useAuthStore();

  if (isAuthenticated) {
    return <button onClick={logout}>Déconnexion ({user.prenom})</button>;
  }
}
```

---

## 🔄 2. SWR : Le "Data Fetching" et la Gestion du Cache

**SWR** (Stale-While-Revalidate) s'occupe de récupérer les données distantes, de les mettre en cache, et d'éviter les appels réseaux inutiles.

### Son Rôle dans l'Application

Récupérer des listes (Offres, Favoris, etc) sans utiliser de `useEffect` ni de `useState`.

### Exemple d'implémentation (Un composant qui liste des offres)

```javascript
// src/pages/public/OffresPage.jsx
import useSWR from "swr";
import { fetcher } from "@/api/fetcher"; // Notre instance Axios configurée

function OffresPage() {
  // SWR gère tout : la donnée, le chargement, et l'erreur.
  // URL: '/offres'
  const { data, isLoading, error } = useSWR("/offres", fetcher);

  if (isLoading) return <p>Chargement des offres...</p>;
  if (error) return <p>Erreur lors du chargement.</p>;

  // `data.data` car notre Backend (AdonisJS) renvoie souvent un objet { data: [...] }
  const offres = data?.data || [];

  return (
    <ul>
      {offres.map((offre) => (
        <li key={offre.id}>{offre.titre}</li>
      ))}
    </ul>
  );
}
```

---

## 🤝 3. Comment Zustand, SWR et Axios travaillent ensemble

C'est là que la magie opère. Ces outils ne rentrent pas en conflit, mais se complètent en utilisant **Axios** comme pont de communication silencieux.

### A. Le Fetcher de base

On commence par créer notre instance (Le "Transporteur")

```javascript
// src/api/fetcher.js
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ex: http://localhost:3333/api
});
```

### B. L'Intercepteur (Le garde du corps)

Avant chaque requête qui part via SWR ou Axios, ce code s'exécute automatiquement.
Il va piocher dans **Zustand** silencieusement pour inclure le Token de sécurité dans la requête **SWR**.

```javascript
// Toujours dans src/api/fetcher.js

api.interceptors.request.use(
  (config) => {
    // 1. On "lit" l'état Zustand SANS être dans un composant React
    const token = useAuthStore.getState().accessToken;

    // 2. Si on a un token, on l'injecte dans le Header 'Authorization'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// La fonction qu'utilise SWR tout le temps
export const fetcher = (url) => api.get(url).then((res) => res.data);
```

### C. Exemple d'un flux complet combiné

Imaginons que l'on veuille créer une offre (Action POST, pas géré par SWR mais par Axios directement) :

```javascript
// src/hooks/useOffres.js
import { api } from "@/api/fetcher";

export const createOffre = async (offreData) => {
  // 1. On utilise 'api' (donc l'intercepteur va chercher le Token Zustand)
  const response = await api.post("/offres", offreData);
  return response.data;
};
```

Imaginons qu'ensuite, on veuille recharger la liste des offres avec _SWR_ :

```javascript
// src/pages/NouvelleOffre.jsx
import { useSWRConfig } from "swr";
import { createOffre } from "@/hooks/useOffres";

function Formulaire() {
  const { mutate } = useSWRConfig(); // Outil de SWR pour forcer le rafraîchissement d'une route précise

  const onSubmit = async () => {
    // Fait un POST (avec Token de Zustand via Axios)
    await createOffre({ titre: "Développeur React Vercel" });

    // Invalide le cache SWR des listes d'offres pour qu'il aille chercher la p'tite nouvelle !
    mutate("/offres");
  };
}
```

## 📝 En Résumé

1. **Zustand :** Stocke le **Token** dans la mémoire du navigateur.
2. **Axios :** Regarde dans **Zustand** avant chaque action serveur et glisse le Token dans la poche de la requête HTTP (Header).
3. **SWR :** Utilise **Axios** en arrière-plan pour interroger ses routes distantes, obtient son Token gratuitement par la même occasion, et nourrit tes composants React (`data`, `isLoading`).
