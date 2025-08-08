// Charte graphique TerraCréa
export const COLORS = {
  // Couleurs principales
  primary: "#4a5c4a", // Vert principal
  secondary: "#7a8a7a", // Gris-vert secondaire

  // Couleurs d'accent
  accent: "#ff6b35", // Orange pour les prix
  success: "#22c55e", // Vert pour les succès
  warning: "#f59e0b", // Orange pour les avertissements

  // Couleur rouge pâle et harmonieuse avec la charte
  danger: "#e11d48", // Rouge pâle et doux

  // Couleurs neutres
  white: "#fff",
  lightGray: "#f5f5f5",
  gray: "#e8e9e8",
  darkGray: "#9ca3af",
  black: "#000",

  // Couleurs de fond
  background: "#fafaf9",
  cardBackground: "#fff",

  // Couleurs de texte
  textPrimary: "#4a5c4a",
  textSecondary: "#7a8a7a",
  textLight: "#9ca3af",
  textOnPrimary: "#ffffff",

  // Couleurs de bordure
  border: "#e8e9e8",
  borderError: "#dc2626",

  // Couleurs d'overlay
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

// Types pour TypeScript
export type ColorKey = keyof typeof COLORS;
