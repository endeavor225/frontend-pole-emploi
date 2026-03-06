import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ---- State ----
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // ---- Computed helpers ----
      getRole: () => get().user?.role ?? null,
      isCandidat: () => get().user?.role === "CANDIDAT",
      isRecruteur: () => get().user?.role === "RECRUTEUR",
      isAdmin: () => get().user?.role === "ADMIN",
      //isAuthenticated: () => !!get().accessToken,

      // ---- Actions ----
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "pajdef-auth",
    },
  ),
);
