import { describe, it, expect } from "vitest";
import {
  headerStyles,
  inputStyles,
  buttonStyles,
  cardStyles,
  emptyStyles,
  loadingStyles,
  modalStyles,
} from "../../utils/commonStyles";
import { COLORS } from "../../utils/colors";

describe("commonStyles", () => {
  describe("headerStyles", () => {
    it("devrait avoir tous les styles de header", () => {
      expect(headerStyles).toHaveProperty("container");
      expect(headerStyles).toHaveProperty("backButton");
      expect(headerStyles).toHaveProperty("backButtonText");
      expect(headerStyles).toHaveProperty("title");
      expect(headerStyles).toHaveProperty("actionButton");
      expect(headerStyles).toHaveProperty("actionButtonText");
      expect(headerStyles).toHaveProperty("actionButtonDisabled");
      expect(headerStyles).toHaveProperty("favoritesButton");
      expect(headerStyles).toHaveProperty("favoritesButtonText");
    });

    it("devrait avoir le style container avec les bonnes propriétés", () => {
      const container = headerStyles.container;

      expect(container.flexDirection).toBe("row");
      expect(container.justifyContent).toBe("space-between");
      expect(container.alignItems).toBe("center");
      expect(container.paddingHorizontal).toBe(20);
      expect(container.paddingVertical).toBe(16);
      expect(container.backgroundColor).toBe("#ffffff");
      expect(container.borderBottomWidth).toBe(1);
      expect(container.borderBottomColor).toBe(COLORS.border);
      expect(container.elevation).toBe(2);
      expect(container.shadowColor).toBe(COLORS.black);
      expect(container.shadowOffset).toEqual({ width: 0, height: 2 });
      expect(container.shadowOpacity).toBe(0.1);
      expect(container.shadowRadius).toBe(3);
      expect(container.width).toBe("100%");
    });

    it("devrait avoir le style backButton avec les bonnes propriétés", () => {
      const backButton = headerStyles.backButton;

      expect(backButton.padding).toBe(8);
      expect(backButton.borderRadius).toBe(8);
      expect(backButton.backgroundColor).toBe("#f5f5f4");
      expect(backButton.borderWidth).toBe(1);
      expect(backButton.borderColor).toBe(COLORS.border);
      expect(backButton.width).toBe(40);
      expect(backButton.alignItems).toBe("center");
    });

    it("devrait avoir le style title avec les bonnes propriétés", () => {
      const title = headerStyles.title;

      expect(title.fontSize).toBe(18);
      expect(title.fontWeight).toBe("600");
      expect(title.color).toBe(COLORS.primary);
      expect(title.fontFamily).toBe("System");
      expect(title.letterSpacing).toBe(0.3);
      expect(title.flex).toBe(1);
      expect(title.textAlign).toBe("center");
    });

    it("devrait avoir le style actionButton avec les bonnes propriétés", () => {
      const actionButton = headerStyles.actionButton;

      expect(actionButton.backgroundColor).toBe(COLORS.primary);
      expect(actionButton.paddingVertical).toBe(8);
      expect(actionButton.paddingHorizontal).toBe(16);
      expect(actionButton.borderRadius).toBe(8);
      expect(actionButton.minWidth).toBe(80);
      expect(actionButton.alignItems).toBe("center");
    });

    it("devrait avoir le style favoritesButton avec les bonnes propriétés", () => {
      const favoritesButton = headerStyles.favoritesButton;

      expect(favoritesButton.backgroundColor).toBe("transparent");
      expect(favoritesButton.paddingVertical).toBe(8);
      expect(favoritesButton.paddingHorizontal).toBe(14);
      expect(favoritesButton.borderRadius).toBe(20);
      expect(favoritesButton.minWidth).toBe(65);
      expect(favoritesButton.alignItems).toBe("center");
      expect(favoritesButton.borderWidth).toBe(2);
      expect(favoritesButton.borderColor).toBe(COLORS.primary);
    });
  });

  describe("inputStyles", () => {
    it("devrait avoir tous les styles d'input", () => {
      expect(inputStyles).toHaveProperty("container");
      expect(inputStyles).toHaveProperty("label");
      expect(inputStyles).toHaveProperty("input");
      expect(inputStyles).toHaveProperty("inputError");
      expect(inputStyles).toHaveProperty("textArea");
      expect(inputStyles).toHaveProperty("charCount");
      expect(inputStyles).toHaveProperty("errorText");
    });

    it("devrait avoir le style container avec les bonnes propriétés", () => {
      const container = inputStyles.container;

      expect(container.marginBottom).toBe(24);
    });

    it("devrait avoir le style label avec les bonnes propriétés", () => {
      const label = inputStyles.label;

      expect(label.fontSize).toBe(16);
      expect(label.fontWeight).toBe("600");
      expect(label.color).toBe(COLORS.primary);
      expect(label.marginBottom).toBe(8);
      expect(label.fontFamily).toBe("System");
    });

    it("devrait avoir le style input avec les bonnes propriétés", () => {
      const input = inputStyles.input;

      expect(input.borderWidth).toBe(1.5);
      expect(input.borderColor).toBe(COLORS.border);
      expect(input.borderRadius).toBe(12);
      expect(input.padding).toBe(16);
      expect(input.fontSize).toBe(16);
      expect(input.backgroundColor).toBe(COLORS.white);
      expect(input.color).toBe(COLORS.primary);
      expect(input.fontFamily).toBe("System");
      expect(input.elevation).toBe(1);
      expect(input.shadowColor).toBe(COLORS.black);
      expect(input.shadowOffset).toEqual({ width: 0, height: 1 });
      expect(input.shadowOpacity).toBe(0.05);
      expect(input.shadowRadius).toBe(2);
    });

    it("devrait avoir le style inputError avec les bonnes propriétés", () => {
      const inputError = inputStyles.inputError;

      expect(inputError.borderColor).toBe(COLORS.danger);
      expect(inputError.backgroundColor).toBe("#fef2f2");
    });

    it("devrait avoir le style textArea avec les bonnes propriétés", () => {
      const textArea = inputStyles.textArea;

      expect(textArea.height).toBe(100);
      expect(textArea.textAlignVertical).toBe("top");
    });

    it("devrait avoir le style errorText avec les bonnes propriétés", () => {
      const errorText = inputStyles.errorText;

      expect(errorText.fontSize).toBe(12);
      expect(errorText.color).toBe(COLORS.danger);
      expect(errorText.marginTop).toBe(4);
      expect(errorText.fontFamily).toBe("System");
    });
  });

  describe("buttonStyles", () => {
    it("devrait avoir tous les styles de bouton", () => {
      expect(buttonStyles).toHaveProperty("primary");
      expect(buttonStyles).toHaveProperty("secondary");
      expect(buttonStyles).toHaveProperty("danger");
      expect(buttonStyles).toHaveProperty("disabled");
      expect(buttonStyles).toHaveProperty("primaryText");
      expect(buttonStyles).toHaveProperty("secondaryText");
      expect(buttonStyles).toHaveProperty("dangerText");
      expect(buttonStyles).toHaveProperty("disabledText");
    });

    it("devrait avoir le style primary avec les bonnes propriétés", () => {
      const primary = buttonStyles.primary;

      expect(primary.backgroundColor).toBe(COLORS.primary);
      expect(primary.paddingVertical).toBe(6);
      expect(primary.paddingHorizontal).toBe(12);
      expect(primary.borderRadius).toBe(8);
      expect(primary.alignItems).toBe("center");
      expect(primary.justifyContent).toBe("center");
    });

    it("devrait avoir le style secondary avec les bonnes propriétés", () => {
      const secondary = buttonStyles.secondary;

      expect(secondary.backgroundColor).toBe(COLORS.white);
      expect(secondary.paddingVertical).toBe(6);
      expect(secondary.paddingHorizontal).toBe(12);
      expect(secondary.borderRadius).toBe(8);
      expect(secondary.borderWidth).toBe(1);
      expect(secondary.borderColor).toBe(COLORS.border);
      expect(secondary.alignItems).toBe("center");
      expect(secondary.justifyContent).toBe("center");
    });

    it("devrait avoir le style danger avec les bonnes propriétés", () => {
      const danger = buttonStyles.danger;

      expect(danger.backgroundColor).toBe(COLORS.danger);
      expect(danger.paddingVertical).toBe(6);
      expect(danger.paddingHorizontal).toBe(12);
      expect(danger.borderRadius).toBe(8);
      expect(danger.alignItems).toBe("center");
      expect(danger.justifyContent).toBe("center");
    });

    it("devrait avoir le style disabled avec les bonnes propriétés", () => {
      const disabled = buttonStyles.disabled;

      expect(disabled.backgroundColor).toBe(COLORS.darkGray);
      expect(disabled.paddingVertical).toBe(6);
      expect(disabled.paddingHorizontal).toBe(12);
      expect(disabled.borderRadius).toBe(8);
      expect(disabled.alignItems).toBe("center");
      expect(disabled.justifyContent).toBe("center");
    });

    it("devrait avoir le style primaryText avec les bonnes propriétés", () => {
      const primaryText = buttonStyles.primaryText;

      expect(primaryText.color).toBe(COLORS.white);
      expect(primaryText.fontSize).toBe(16);
      expect(primaryText.fontWeight).toBe("600");
      expect(primaryText.fontFamily).toBe("System");
    });

    it("devrait avoir le style secondaryText avec les bonnes propriétés", () => {
      const secondaryText = buttonStyles.secondaryText;

      expect(secondaryText.color).toBe(COLORS.primary);
      expect(secondaryText.fontSize).toBe(16);
      expect(secondaryText.fontWeight).toBe("600");
      expect(secondaryText.fontFamily).toBe("System");
    });
  });

  describe("cardStyles", () => {
    it("devrait avoir tous les styles de carte", () => {
      expect(cardStyles).toHaveProperty("container");
      expect(cardStyles).toHaveProperty("title");
      expect(cardStyles).toHaveProperty("description");
    });

    it("devrait avoir le style container avec les bonnes propriétés", () => {
      const container = cardStyles.container;

      expect(container.backgroundColor).toBe("#fefefe");
      expect(container.borderRadius).toBe(12);
      expect(container.padding).toBe(16);
      expect(container.marginBottom).toBe(16);
      expect(container.elevation).toBe(2);
      expect(container.shadowColor).toBe(COLORS.black);
      expect(container.shadowOffset).toEqual({ width: 0, height: 2 });
      expect(container.shadowOpacity).toBe(0.1);
      expect(container.shadowRadius).toBe(3);
    });

    it("devrait avoir le style title avec les bonnes propriétés", () => {
      const title = cardStyles.title;

      expect(title.fontSize).toBe(18);
      expect(title.fontWeight).toBe("600");
      expect(title.color).toBe(COLORS.primary);
      expect(title.marginBottom).toBe(8);
      expect(title.fontFamily).toBe("System");
    });

    it("devrait avoir le style description avec les bonnes propriétés", () => {
      const description = cardStyles.description;

      expect(description.fontSize).toBe(14);
      expect(description.color).toBe(COLORS.textSecondary);
      expect(description.lineHeight).toBe(20);
      expect(description.fontFamily).toBe("System");
    });
  });

  describe("emptyStyles", () => {
    it("devrait avoir tous les styles d'état vide", () => {
      expect(emptyStyles).toHaveProperty("container");
      expect(emptyStyles).toHaveProperty("title");
      expect(emptyStyles).toHaveProperty("description");
    });

    it("devrait avoir le style container avec les bonnes propriétés", () => {
      const container = emptyStyles.container;

      expect(container.flex).toBe(1);
      expect(container.justifyContent).toBe("center");
      expect(container.alignItems).toBe("center");
      expect(container.paddingVertical).toBe(60);
    });

    it("devrait avoir le style title avec les bonnes propriétés", () => {
      const title = emptyStyles.title;

      expect(title.fontSize).toBe(20);
      expect(title.fontWeight).toBe("600");
      expect(title.color).toBe(COLORS.primary);
      expect(title.marginBottom).toBe(12);
      expect(title.fontFamily).toBe("System");
    });

    it("devrait avoir le style description avec les bonnes propriétés", () => {
      const description = emptyStyles.description;

      expect(description.fontSize).toBe(16);
      expect(description.color).toBe(COLORS.textSecondary);
      expect(description.textAlign).toBe("center");
      expect(description.marginBottom).toBe(24);
      expect(description.lineHeight).toBe(24);
      expect(description.fontFamily).toBe("System");
    });
  });

  describe("loadingStyles", () => {
    it("devrait avoir tous les styles de chargement", () => {
      expect(loadingStyles).toHaveProperty("container");
      expect(loadingStyles).toHaveProperty("text");
    });

    it("devrait avoir le style container avec les bonnes propriétés", () => {
      const container = loadingStyles.container;

      expect(container.flex).toBe(1);
      expect(container.justifyContent).toBe("center");
      expect(container.alignItems).toBe("center");
      expect(container.paddingVertical).toBe(40);
    });

    it("devrait avoir le style text avec les bonnes propriétés", () => {
      const text = loadingStyles.text;

      expect(text.fontSize).toBe(16);
      expect(text.color).toBe(COLORS.textSecondary);
      expect(text.fontFamily).toBe("System");
    });
  });

  describe("modalStyles", () => {
    it("devrait avoir tous les styles de modal", () => {
      expect(modalStyles).toHaveProperty("overlay");
      expect(modalStyles).toHaveProperty("content");
      expect(modalStyles).toHaveProperty("title");
      expect(modalStyles).toHaveProperty("message");
      expect(modalStyles).toHaveProperty("actions");
    });

    it("devrait avoir le style overlay avec les bonnes propriétés", () => {
      const overlay = modalStyles.overlay;

      expect(overlay.flex).toBe(1);
      expect(overlay.backgroundColor).toBe(COLORS.overlay);
      expect(overlay.justifyContent).toBe("center");
      expect(overlay.alignItems).toBe("center");
    });

    it("devrait avoir le style content avec les bonnes propriétés", () => {
      const content = modalStyles.content;

      expect(content.backgroundColor).toBe(COLORS.white);
      expect(content.borderRadius).toBe(12);
      expect(content.padding).toBe(24);
      expect(content.margin).toBe(20);
      expect(content.maxWidth).toBe(400);
      expect(content.width).toBe("100%");
    });

    it("devrait avoir le style title avec les bonnes propriétés", () => {
      const title = modalStyles.title;

      expect(title.fontSize).toBe(18);
      expect(title.fontWeight).toBe("600");
      expect(title.color).toBe(COLORS.primary);
      expect(title.marginBottom).toBe(16);
      expect(title.textAlign).toBe("center");
      expect(title.fontFamily).toBe("System");
    });

    it("devrait avoir le style message avec les bonnes propriétés", () => {
      const message = modalStyles.message;

      expect(message.fontSize).toBe(16);
      expect(message.color).toBe(COLORS.textSecondary);
      expect(message.textAlign).toBe("center");
      expect(message.marginBottom).toBe(24);
      expect(message.lineHeight).toBe(24);
      expect(message.fontFamily).toBe("System");
    });

    it("devrait avoir le style actions avec les bonnes propriétés", () => {
      const actions = modalStyles.actions;

      expect(actions.flexDirection).toBe("row");
      expect(actions.gap).toBe(12);
    });
  });

  describe("Cohérence des styles", () => {
    it("devrait utiliser les couleurs de la charte graphique", () => {
      // Vérifier que les styles utilisent bien les couleurs définies
      expect(headerStyles.title.color).toBe(COLORS.primary);
      expect(buttonStyles.primary.backgroundColor).toBe(COLORS.primary);
      expect(inputStyles.label.color).toBe(COLORS.primary);
      expect(cardStyles.title.color).toBe(COLORS.primary);
    });

    it("devrait avoir des tailles de police cohérentes", () => {
      // Vérifier la cohérence des tailles de police
      const fontSizes = [
        headerStyles.title.fontSize,
        inputStyles.label.fontSize,
        buttonStyles.primaryText.fontSize,
        cardStyles.title.fontSize,
        emptyStyles.title.fontSize,
        modalStyles.title.fontSize,
      ];

      // Tous les titres devraient avoir des tailles cohérentes
      expect(fontSizes).toContain(18);
      expect(fontSizes).toContain(20);
    });

    it("devrait avoir des rayons de bordure cohérents", () => {
      // Vérifier la cohérence des rayons de bordure
      const borderRadiuses = [
        headerStyles.backButton.borderRadius,
        headerStyles.actionButton.borderRadius,
        headerStyles.favoritesButton.borderRadius,
        inputStyles.input.borderRadius,
        buttonStyles.primary.borderRadius,
        cardStyles.container.borderRadius,
        modalStyles.content.borderRadius,
      ];

      // Les rayons devraient être cohérents (8, 12, 20)
      expect(borderRadiuses).toContain(8);
      expect(borderRadiuses).toContain(12);
      expect(borderRadiuses).toContain(20);

      // Vérifier qu'il n'y a pas de rayons inattendus
      borderRadiuses.forEach((radius) => {
        expect([8, 12, 20]).toContain(radius);
      });
    });
  });

  describe("Structure des styles", () => {
    it("devrait avoir des objets StyleSheet valides", () => {
      const allStyles = [
        headerStyles,
        inputStyles,
        buttonStyles,
        cardStyles,
        emptyStyles,
        loadingStyles,
        modalStyles,
      ];

      allStyles.forEach((styleSheet) => {
        expect(typeof styleSheet).toBe("object");
        expect(styleSheet).not.toBeNull();
        expect(Object.keys(styleSheet).length).toBeGreaterThan(0);
      });
    });

    it("devrait avoir des propriétés de style valides", () => {
      const allStyles = [
        headerStyles,
        inputStyles,
        buttonStyles,
        cardStyles,
        emptyStyles,
        loadingStyles,
        modalStyles,
      ];

      allStyles.forEach((styleSheet) => {
        Object.values(styleSheet).forEach((style) => {
          expect(typeof style).toBe("object");
          expect(style).not.toBeNull();
        });
      });
    });
  });
});
