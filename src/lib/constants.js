// ========================
// Rôles utilisateur
// ========================
export const ROLES = {
  CANDIDAT: "CANDIDAT",
  RECRUTEUR: "RECRUTEUR",
  ADMIN: "ADMIN",
};

// ========================
// Statuts candidature
// ========================
export const STATUT_CANDIDATURE = {
  EN_ATTENTE: "en_attente",
  ACCEPTEE: "acceptee",
  REFUSEE: "refusee",
};

export const STATUTS_CANDIDATURE = [
  { value: "en_attente", label: "En attente" },
  { value: "acceptee", label: "Acceptée" },
  { value: "refusee", label: "Refusée" },
];

export const STATUT_CANDIDATURE_LABELS = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

export const STATUT_CANDIDATURE_VARIANTS = {
  en_attente: "outline",
  acceptee: "default",
  refusee: "destructive",
};

// ========================
// Types d'offre
// ========================
export const TYPES_OFFRE = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Stage", label: "Stage" },
  { value: "Interim", label: "Intérim" },
  { value: "Freelance", label: "Freelance" },
  { value: "Consultance", label: "Consultance" },
];

/** Couleurs de badge par type d'offre */
export const TYPE_OFFRE_COLORS = {
  CDI: { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" }, // ambre
  CDD: { bg: "#CFFAFE", text: "#0E7490", border: "#A5F3FC" }, // cyan
  Stage: { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" }, // violet
  Interim: { bg: "#E0E7FF", text: "#4338CA", border: "#C7D2FE" }, // indigo
  Freelance: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" }, // vert
  Consultance: { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" }, // bleu
};

/** Options de tri pour la page des offres */
export const SORT_OPTIONS = [
  { value: "recent", label: "Le plus récent" },
  { value: "ancien", label: "Le plus ancien" },
];

/** Options de lieu de travail */
export const LIEU_OPTIONS = [
  { value: "Sur site", label: "Sur site" },
  { value: "Hybride", label: "Hybride" },
  { value: "A distance", label: "À distance" },
];

// ========================
// Statuts offre
// ========================
export const STATUT_OFFRE = {
  ACTIVE: "active",
  EXPIREE: "expiree",
  SUSPENDUE: "suspendue",
};

// ========================
// Types notification
// ========================
export const NOTIFICATION_TYPES = {
  NOUVELLE_CANDIDATURE: "nouvelle_candidature",
  CANDIDATURE_STATUT: "candidature_statut",
};

// ========================
// Pagination par défaut
// ========================
export const DEFAULT_PAGE_SIZE = 10;
