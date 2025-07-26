import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Constantes globales pour éviter le débordement horizontal
export const SCREEN_CONSTANTS = {
  // Espacements
  HORIZONTAL_PADDING: 16,
  VERTICAL_PADDING: 12,
  CARD_SPACING: 6,

  // Dimensions calculées
  CONTENT_WIDTH: screenWidth - 32, // screenWidth - (HORIZONTAL_PADDING * 2)
  SAFE_MARGIN: 4, // Marge de sécurité pour éviter tout débordement

  // Largeurs pour grilles
  TWO_COLUMN_CARD_WIDTH: (screenWidth - 32 - 6 - 4) / 2, // Pour grille 2 colonnes
  THREE_COLUMN_CARD_WIDTH: (screenWidth - 32 - 12 - 4) / 3, // Pour grille 3 colonnes

  // Constantes spécifiques pour les articles
  ARTICLE_CARD: {
    WIDTH: screenWidth - 32, // Largeur complète pour les articles
    MIN_HEIGHT: 600, // Hauteur minimale pour éviter la troncature
    MAX_HEIGHT: 700, // Hauteur maximale recommandée
    IMAGE_HEIGHT: 280, // Hauteur de l'image
    CONTENT_PADDING: 20, // Padding interne du contenu
    CONTENT_MIN_HEIGHT: 280, // Hauteur minimale pour le contenu texte
  },

  // Tailles de police optimisées
  FONT_SIZES: {
    HEADER: 17,
    TITLE: 15,
    BODY: 13,
    SMALL: 11,
    TINY: 9,
  },

  // Rayons de bordure
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 10,
    LARGE: 12,
    EXTRA_LARGE: 16,
  },

  // Palette de couleurs TerraCréa élégante
  COLORS: {
    // Couleurs principales
    PRIMARY: "#4a5c4a", // Vert terre principal
    PRIMARY_LIGHT: "#6b7c6b", // Vert terre clair
    PRIMARY_DARK: "#3a4a3a", // Vert terre foncé

    // Couleurs secondaires
    SECONDARY: "#7a8a7a", // Gris vert
    SECONDARY_LIGHT: "#9aa9aa", // Gris vert clair

    // Couleurs terre et naturelles
    EARTH_WARM: "#d4a574", // Terre chaude
    EARTH_SOFT: "#b8a892", // Terre douce
    EARTH_GOLD: "#c49969", // Or terre
    EARTH_BROWN: "#8b6f47", // Brun terre

    // Couleurs de base
    BACKGROUND: "#fafaf9", // Blanc cassé
    BACKGROUND_CARD: "#ffffff", // Blanc pur pour les cartes
    BACKGROUND_SOFT: "#f5f6f5", // Gris très clair
    WHITE: "#fff",

    // Couleurs de bordure et séparation
    BORDER: "#e8e9e8", // Bordure douce
    BORDER_LIGHT: "#f0f1f0", // Bordure très claire
    DIVIDER: "#e0e2e0", // Séparateur

    // Couleurs de texte
    TEXT_PRIMARY: "#2d3a2d", // Texte principal
    TEXT_SECONDARY: "#6a7a6a", // Texte secondaire
    TEXT_TERTIARY: "#8a9a8a", // Texte tertiaire
    TEXT_MUTED: "#aab0aa", // Texte atténué

    // Couleurs d'état
    SUCCESS: "#4caf50", // Vert succès
    WARNING: "#ff9800", // Orange avertissement
    ERROR: "#f44336", // Rouge erreur
    INFO: "#2196f3", // Bleu information

    // Couleurs d'accentuation
    ACCENT_WARM: "#e8d5c4", // Accent chaud
    ACCENT_COOL: "#d5e8d5", // Accent frais
    ACCENT_NEUTRAL: "#e5e8e5", // Accent neutre

    // Couleurs avec transparence pour les overlays
    OVERLAY_DARK: "rgba(45, 58, 45, 0.8)", // Overlay sombre
    OVERLAY_LIGHT: "rgba(255, 255, 255, 0.9)", // Overlay clair
    SHADOW: "rgba(74, 92, 74, 0.15)", // Ombre principale
  },

  // Dimensions d'écran
  SCREEN_WIDTH: screenWidth,
  SCREEN_HEIGHT: screenHeight,

  // Limites maximales pour éviter les débordements
  MAX_BUTTON_WIDTH: screenWidth * 0.25,
  MAX_CARD_WIDTH: screenWidth * 0.45,
  MAX_INPUT_WIDTH: screenWidth - 32,

  // Largeurs optimisées pour les éléments d'articles
  CREATOR_NAME_MAX_WIDTH: "100%", // Largeur complète pour le nom du créateur
  CATEGORY_TAG_MAX_WIDTH: "85%", // Plus large pour les catégories
};

// Utilitaires pour les calculs
export const calculateGridWidth = (
  columns: number,
  spacing: number = SCREEN_CONSTANTS.CARD_SPACING
) => {
  const totalSpacing = spacing * (columns - 1);
  const totalPadding = SCREEN_CONSTANTS.HORIZONTAL_PADDING * 2;
  const safeMargin = SCREEN_CONSTANTS.SAFE_MARGIN;

  return (screenWidth - totalPadding - totalSpacing - safeMargin) / columns;
};

export const ensureNoOverflow = (width: number, maxPercent: number = 0.9) => {
  const maxWidth = screenWidth * maxPercent;
  return Math.min(width, maxWidth);
};
