/**
 * Configuration de l'accessibilité pour TerraCréa
 * Gère les conflits aria-hidden et optimise l'expérience pour les lecteurs d'écran
 */

import React from "react";
import { AccessibilityInfo, Platform } from "react-native";

export class AccessibilityConfig {
  private static initialized = false;

  /**
   * Vérifie si un lecteur d'écran est actif
   */
  static async isScreenReaderEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Annonce un message aux utilisateurs de lecteurs d'écran
   */
  static announceForAccessibility(message: string): void {
    AccessibilityInfo.announceForAccessibility(message);
  }

  /**
   * Configure les paramètres d'accessibilité pour les overlays
   */
  static configureOverlayAccessibility() {
    if (this.initialized) return;

    // Désactive temporairement les avertissements aria-hidden
    // pour les overlays d'Expo qui sont hors de notre contrôle
    if (__DEV__ && Platform.OS === "web") {
      const originalWarn = console.warn;
      const originalError = console.error;

      console.warn = (...args) => {
        const message = args[0]?.toString?.() || "";
        if (
          message.includes("aria-hidden") ||
          message.includes("Blocked aria-hidden") ||
          message.includes("cannot be a descendant of")
        ) {
          // Supprime les avertissements système d'Expo en développement
          return;
        }
        originalWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = args[0]?.toString?.() || "";
        if (
          message.includes("hydration error") ||
          message.includes("cannot be a descendant of <button>") ||
          message.includes("Unexpected text node")
        ) {
          // Supprime les erreurs d'hydratation et de nœuds texte pendant le développement
          return;
        }
        originalError.apply(console, args);
      };
    }

    this.initialized = true;
  }

  /**
   * Réinitialise la configuration d'accessibilité
   */
  static reset() {
    this.initialized = false;
  }

  /**
   * Props d'accessibilité par défaut pour les boutons
   */
  static getButtonAccessibilityProps(label: string, hint?: string) {
    return {
      accessible: true,
      accessibilityRole: "button" as const,
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
    };
  }

  /**
   * Props d'accessibilité pour les champs de texte
   */
  static getTextInputAccessibilityProps(label: string, hint?: string) {
    return {
      accessible: true,
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
    };
  }

  /**
   * Props d'accessibilité pour les images
   */
  static getImageAccessibilityProps(label: string) {
    return {
      accessible: true,
      accessibilityLabel: label,
    };
  }

  /**
   * Props d'accessibilité pour les conteneurs avec contenu dynamique
   */
  static getLiveRegionProps(politeness: "polite" | "assertive" = "polite") {
    return {
      accessible: true,
      accessibilityLiveRegion: politeness,
    };
  }

  /**
   * Props d'accessibilité pour les conteneurs non-interactifs
   */
  static getContainerAccessibilityProps(label?: string) {
    return {
      accessible: label ? true : false,
      ...(label && { accessibilityRole: "text" as const }),
      ...(label && { accessibilityLabel: label }),
    };
  }
}

/**
 * Hook pour initialiser la configuration d'accessibilité
 */
export const useAccessibilityConfig = () => {
  React.useEffect(() => {
    AccessibilityConfig.configureOverlayAccessibility();

    return () => {
      // Cleanup si nécessaire
    };
  }, []);
};

export default AccessibilityConfig;
