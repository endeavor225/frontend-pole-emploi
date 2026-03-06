import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor — injection automatique du token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — refresh automatique sur 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Ne pas tenter un refresh si l'erreur 401 survient lors de la connexion ou du refresh lui-même
    if (
      original.url?.includes("/login") ||
      original.url?.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { refreshToken, isAuthenticated } = useAuthStore.getState();

      /* Si l'utilisateur n'est pas authentifié (ex: juste après login,
         token pas encore propagé), on rejette sans tenter le refresh */
      if (!isAuthenticated || !refreshToken) {
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken },
        );

        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        useAuthStore.getState().logout();
        /* Redirige vers /login seulement si l'utilisateur était connecté
           (évite la boucle infinie sur la page de login elle-même) */
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
