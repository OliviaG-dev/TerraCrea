import { describe, it, expect } from "vitest";
import { COLORS, type ColorKey } from "../../utils/colors";

describe("colors", () => {
  describe("Structure des couleurs", () => {
    it("devrait avoir toutes les couleurs principales", () => {
      expect(COLORS).toHaveProperty("primary");
      expect(COLORS).toHaveProperty("secondary");
      expect(COLORS).toHaveProperty("accent");
      expect(COLORS).toHaveProperty("success");
      expect(COLORS).toHaveProperty("warning");
      expect(COLORS).toHaveProperty("danger");
    });

    it("devrait avoir toutes les couleurs neutres", () => {
      expect(COLORS).toHaveProperty("white");
      expect(COLORS).toHaveProperty("lightGray");
      expect(COLORS).toHaveProperty("gray");
      expect(COLORS).toHaveProperty("darkGray");
      expect(COLORS).toHaveProperty("black");
    });

    it("devrait avoir toutes les couleurs de fond", () => {
      expect(COLORS).toHaveProperty("background");
      expect(COLORS).toHaveProperty("cardBackground");
    });

    it("devrait avoir toutes les couleurs de texte", () => {
      expect(COLORS).toHaveProperty("textPrimary");
      expect(COLORS).toHaveProperty("textSecondary");
      expect(COLORS).toHaveProperty("textLight");
      expect(COLORS).toHaveProperty("textOnPrimary");
    });

    it("devrait avoir toutes les couleurs de bordure", () => {
      expect(COLORS).toHaveProperty("border");
      expect(COLORS).toHaveProperty("borderError");
    });

    it("devrait avoir toutes les couleurs d'overlay", () => {
      expect(COLORS).toHaveProperty("overlay");
    });
  });

  describe("Valeurs des couleurs", () => {
    it("devrait avoir la couleur primaire verte", () => {
      expect(COLORS.primary).toBe("#4a5c4a");
    });

    it("devrait avoir la couleur secondaire gris-vert", () => {
      expect(COLORS.secondary).toBe("#7a8a7a");
    });

    it("devrait avoir la couleur d'accent orange", () => {
      expect(COLORS.accent).toBe("#ff6b35");
    });

    it("devrait avoir la couleur de succès verte", () => {
      expect(COLORS.success).toBe("#22c55e");
    });

    it("devrait avoir la couleur d'avertissement orange", () => {
      expect(COLORS.warning).toBe("#f59e0b");
    });

    it("devrait avoir la couleur de danger rouge pâle", () => {
      expect(COLORS.danger).toBe("#e11d48");
    });

    it("devrait avoir la couleur blanche", () => {
      expect(COLORS.white).toBe("#fff");
    });

    it("devrait avoir la couleur gris clair", () => {
      expect(COLORS.lightGray).toBe("#f5f5f5");
    });

    it("devrait avoir la couleur gris", () => {
      expect(COLORS.gray).toBe("#e8e9e8");
    });

    it("devrait avoir la couleur gris foncé", () => {
      expect(COLORS.darkGray).toBe("#9ca3af");
    });

    it("devrait avoir la couleur noire", () => {
      expect(COLORS.black).toBe("#000");
    });

    it("devrait avoir la couleur de fond", () => {
      expect(COLORS.background).toBe("#fafaf9");
    });

    it("devrait avoir la couleur de fond de carte", () => {
      expect(COLORS.cardBackground).toBe("#fff");
    });

    it("devrait avoir la couleur de texte primaire", () => {
      expect(COLORS.textPrimary).toBe("#4a5c4a");
    });

    it("devrait avoir la couleur de texte secondaire", () => {
      expect(COLORS.textSecondary).toBe("#7a8a7a");
    });

    it("devrait avoir la couleur de texte clair", () => {
      expect(COLORS.textLight).toBe("#9ca3af");
    });

    it("devrait avoir la couleur de texte sur primaire", () => {
      expect(COLORS.textOnPrimary).toBe("#ffffff");
    });

    it("devrait avoir la couleur de bordure", () => {
      expect(COLORS.border).toBe("#e8e9e8");
    });

    it("devrait avoir la couleur de bordure d'erreur", () => {
      expect(COLORS.borderError).toBe("#dc2626");
    });

    it("devrait avoir la couleur d'overlay", () => {
      expect(COLORS.overlay).toBe("rgba(0, 0, 0, 0.5)");
    });
  });

  describe("Format des couleurs", () => {
    it("devrait avoir toutes les couleurs au format hexadécimal valide", () => {
      const hexColors = [
        COLORS.primary,
        COLORS.secondary,
        COLORS.accent,
        COLORS.success,
        COLORS.warning,
        COLORS.danger,
        COLORS.white,
        COLORS.lightGray,
        COLORS.gray,
        COLORS.darkGray,
        COLORS.black,
        COLORS.background,
        COLORS.cardBackground,
        COLORS.textPrimary,
        COLORS.textSecondary,
        COLORS.textLight,
        COLORS.textOnPrimary,
        COLORS.border,
        COLORS.borderError,
      ];

      hexColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
      });
    });

    it("devrait avoir la couleur d'overlay au format rgba valide", () => {
      expect(COLORS.overlay).toMatch(
        /^rgba\([0-9]+, [0-9]+, [0-9]+, [0-9.]+\)$/
      );
    });
  });

  describe("Cohérence des couleurs", () => {
    it("devrait avoir la couleur primaire cohérente avec le texte primaire", () => {
      expect(COLORS.primary).toBe(COLORS.textPrimary);
    });

    it("devrait avoir la couleur secondaire cohérente avec le texte secondaire", () => {
      expect(COLORS.secondary).toBe(COLORS.textSecondary);
    });

    it("devrait avoir la couleur gris cohérente avec la bordure", () => {
      expect(COLORS.gray).toBe(COLORS.border);
    });

    it("devrait avoir la couleur gris clair cohérente avec le fond", () => {
      expect(COLORS.lightGray).toBe("#f5f5f5");
    });

    it("devrait avoir la couleur blanche cohérente avec le fond de carte", () => {
      expect(COLORS.white).toBe(COLORS.cardBackground);
    });
  });

  describe("Accessibilité des couleurs", () => {
    it("devrait avoir un contraste suffisant entre le texte primaire et le fond", () => {
      // Vérifier que le texte primaire n'est pas trop clair sur le fond
      expect(COLORS.textPrimary).not.toBe(COLORS.background);
    });

    it("devrait avoir un contraste suffisant entre le texte et le fond de carte", () => {
      // Vérifier que le texte primaire n'est pas trop clair sur le fond de carte
      expect(COLORS.textPrimary).not.toBe(COLORS.cardBackground);
    });

    it("devrait avoir une couleur de danger distincte", () => {
      // Vérifier que la couleur de danger est différente des autres couleurs
      expect(COLORS.danger).not.toBe(COLORS.primary);
      expect(COLORS.danger).not.toBe(COLORS.secondary);
      expect(COLORS.danger).not.toBe(COLORS.accent);
    });

    it("devrait avoir une couleur de succès distincte", () => {
      // Vérifier que la couleur de succès est différente des autres couleurs
      expect(COLORS.success).not.toBe(COLORS.primary);
      expect(COLORS.success).not.toBe(COLORS.secondary);
      expect(COLORS.success).not.toBe(COLORS.danger);
    });
  });

  describe("Type ColorKey", () => {
    it("devrait permettre l'accès à toutes les clés de couleur", () => {
      const colorKeys: ColorKey[] = [
        "primary",
        "secondary",
        "accent",
        "success",
        "warning",
        "danger",
        "white",
        "lightGray",
        "gray",
        "darkGray",
        "black",
        "background",
        "cardBackground",
        "textPrimary",
        "textSecondary",
        "textLight",
        "textOnPrimary",
        "border",
        "borderError",
        "overlay",
      ];

      colorKeys.forEach((key) => {
        expect(COLORS[key]).toBeDefined();
      });
    });

    it("devrait avoir le bon nombre de couleurs", () => {
      const colorKeys = Object.keys(COLORS) as ColorKey[];
      expect(colorKeys).toHaveLength(20);
    });
  });

  describe("Immutabilité", () => {
    it("devrait maintenir la structure des couleurs", () => {
      const originalColors = { ...COLORS };

      // Vérifier que la structure reste la même
      expect(Object.keys(COLORS)).toEqual(Object.keys(originalColors));
      expect(Object.values(COLORS)).toEqual(Object.values(originalColors));
    });

    it("devrait avoir des couleurs constantes", () => {
      // Vérifier que les couleurs ne changent pas
      const primaryColor = COLORS.primary;
      expect(COLORS.primary).toBe(primaryColor);

      const secondaryColor = COLORS.secondary;
      expect(COLORS.secondary).toBe(secondaryColor);
    });
  });
});
