// ========================
// Auth
// ========================
export const AUTH = {
  REGISTER_CANDIDAT: "/auth/register/candidats",
  REGISTER_RECRUTEUR: "/auth/register/recruteurs",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  VERIFY_EMAIL: "/auth/verify-email",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/auth/me",
  CHANGE_PASSWORD: "/auth/change-password",
};

// ========================
// Offres
// ========================
export const OFFRES = {
  BASE: "/offres",
  DETAIL: (id) => `/offres/${id}`,
};

// ========================
// Candidatures
// ========================
export const CANDIDATURES = {
  BASE: "/candidatures",
  DETAIL: (id) => `/candidatures/${id}`,
  UPDATE: (id) => `/candidatures/${id}`,
};

// ========================
// Favoris
// ========================
export const FAVORIS = {
  BASE: "/favoris",
  DETAIL: (id) => `/favoris/${id}`,
};

// ========================
// Notifications
// ========================
export const NOTIFICATIONS = {
  BASE: "/notifications",
  DETAIL: (id) => `/notifications/${id}`,
  READ: (id) => `/notifications/${id}/read`,
  READ_ALL: "/notifications/read-all",
};

// ========================
// Messages
// ========================
export const MESSAGES = {
  BASE: "/messages",
  DETAIL: (id) => `/messages/${id}`,
  READ: (id) => `/messages/${id}/read`,
  CONVERSATION_READ: "/messages/conversation-read",
};

// ========================
// Candidats
// ========================
export const CANDIDATS = {
  BASE: "/candidats",
  DETAIL: (id) => `/candidats/${id}`,
  UPDATE: (id) => `/candidats/${id}`,
};

// ========================
// Entreprises
// ========================
export const ENTREPRISES = {
  BASE: "/entreprises",
  DETAIL: (id) => `/entreprises/${id}`,
  UPDATE: (id) => `/entreprises/${id}`,
};

// ========================
// Domaines
// ========================
export const DOMAINES = {
  BASE: "/domaines",
};
