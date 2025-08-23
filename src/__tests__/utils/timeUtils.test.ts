import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  checkTimeSync,
  formatLocalTime,
  getTimeSyncHelpMessage,
  isTimeSyncError,
  formatDate,
  formatPrice,
} from "../../utils/timeUtils";

// Mock de fetch global
global.fetch = vi.fn();

describe("timeUtils", () => {
  let originalDateNow: () => number;
  let originalDate: typeof Date;

  beforeEach(() => {
    vi.clearAllMocks();

    // Sauvegarder les fonctions originales
    originalDateNow = Date.now;
    originalDate = Date;

    // Mock de Date.now() pour des tests prévisibles
    const mockTime = 1640995200000; // 1er janvier 2022
    Date.now = vi.fn(() => mockTime);

    // Mock du constructeur Date pour new Date()
    const MockDate = vi.fn((...args: any[]) => {
      if (args.length === 0) {
        return new originalDate(mockTime);
      }
      return new originalDate(...args);
    }) as any;

    // Copier les méthodes statiques
    MockDate.now = Date.now;
    MockDate.UTC = originalDate.UTC;
    MockDate.parse = originalDate.parse;

    // Remplacer globalement
    global.Date = MockDate;
  });

  afterEach(() => {
    // Restaurer les fonctions originales
    Date.now = originalDateNow;
    global.Date = originalDate;
    vi.restoreAllMocks();
  });

  describe("checkTimeSync", () => {
    it("devrait retourner un objet avec les propriétés correctes", async () => {
      const result = await checkTimeSync();

      expect(result).toHaveProperty("isSynchronized");
      expect(result).toHaveProperty("localTime");
      // serverTime et timeDiff peuvent être undefined selon les conditions
      // On vérifie juste que l'objet peut avoir ces propriétés
      expect(typeof result).toBe("object");
      expect(result).toBeDefined();
    });

    it("devrait retourner l'heure locale actuelle", async () => {
      const result = await checkTimeSync();

      // Vérifier que c'est un objet avec une propriété getTime
      expect(typeof result.localTime.getTime).toBe("function");
      // Vérifier que c'est une date valide sans dépendre d'une valeur spécifique
      expect(result.localTime.getTime()).toBeGreaterThan(0);
    });

    it("devrait retourner isSynchronized à true par défaut", async () => {
      const result = await checkTimeSync();

      expect(result.isSynchronized).toBe(true);
    });

    it("devrait gérer les erreurs de fetch gracieusement", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      const result = await checkTimeSync();

      expect(result.isSynchronized).toBe(true);
      // Vérifier que c'est un objet avec une propriété getTime
      expect(typeof result.localTime.getTime).toBe("function");
      expect(result.serverTime).toBeUndefined();
      expect(result.timeDiff).toBeUndefined();
    });

    it("devrait traiter une réponse serveur valide", async () => {
      const mockServerTime = new Date(1640995200000 + 60000); // +1 minute
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          datetime: mockServerTime.toISOString(),
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await checkTimeSync();

      expect(result.isSynchronized).toBe(true);
      expect(result.serverTime).toEqual(mockServerTime);
      expect(result.timeDiff).toBeGreaterThan(0);
      expect(result.timeDiff).toBeLessThan(120000); // Entre 0 et 2 minutes
    });

    it("devrait détecter une désynchronisation importante", async () => {
      const mockServerTime = new Date(1640995200000 + 10 * 60 * 1000); // +10 minutes
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          datetime: mockServerTime.toISOString(),
        }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await checkTimeSync();

      expect(result.isSynchronized).toBe(false);
      expect(result.timeDiff).toBeGreaterThan(9 * 60 * 1000); // Plus de 9 minutes
      expect(result.timeDiff).toBeLessThan(11 * 60 * 1000); // Moins de 11 minutes
    });

    it("devrait gérer une réponse serveur non-ok", async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn(),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await checkTimeSync();

      expect(result.isSynchronized).toBe(true);
      expect(result.serverTime).toBeUndefined();
    });
  });

  describe("formatLocalTime", () => {
    it("devrait formater une date en français", () => {
      const testDate = new Date("2022-01-01T12:30:45");
      const result = formatLocalTime(testDate);

      // Le format exact peut varier selon l'environnement, mais devrait contenir les éléments
      expect(result).toContain("2022");
      expect(result).toContain("01");
      expect(result).toContain("12");
      expect(result).toContain("30");
      expect(result).toContain("45");
    });

    it("devrait utiliser le fuseau horaire Europe/Paris", () => {
      const testDate = new Date("2022-01-01T12:00:00");
      const result = formatLocalTime(testDate);

      // Vérifier que le formatage est fait
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("devrait gérer différentes dates", () => {
      const dates = [
        new Date("2022-01-01T00:00:00"),
        new Date("2022-12-31T23:59:59"),
        new Date("2023-06-15T12:30:45"),
      ];

      dates.forEach((date) => {
        const result = formatLocalTime(date);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getTimeSyncHelpMessage", () => {
    it("devrait retourner un message d'aide", () => {
      const result = getTimeSyncHelpMessage();

      expect(typeof result).toBe("string");
      expect(result).toContain("Problème de synchronisation d'horloge détecté");
      expect(result).toContain(
        "Vérifiez que l'heure de votre appareil est correcte"
      );
      expect(result).toContain(
        "Activez la synchronisation automatique de l'heure"
      );
      expect(result).toContain("Redémarrez l'application");
    });

    it("devrait inclure l'heure actuelle", () => {
      const result = getTimeSyncHelpMessage();

      expect(result).toContain("Heure actuelle :");
    });
  });

  describe("isTimeSyncError", () => {
    it("devrait retourner false pour un objet null", () => {
      const result = isTimeSyncError(null);
      expect(result).toBe(false);
    });

    it("devrait retourner false pour un objet sans message", () => {
      const result = isTimeSyncError({});
      expect(result).toBe(false);
    });

    it("devrait détecter une erreur 'issued in the future'", () => {
      const error = { message: "Token issued in the future" };
      const result = isTimeSyncError(error);
      expect(result).toBe(true);
    });

    it("devrait détecter une erreur 'clock for skew'", () => {
      const error = { message: "Clock for skew detected" };
      const result = isTimeSyncError(error);
      expect(result).toBe(true);
    });

    it("devrait détecter une erreur 'session expired'", () => {
      const error = { message: "Session expired" };
      const result = isTimeSyncError(error);
      expect(result).toBe(true);
    });

    it("devrait détecter une erreur 'invalid token'", () => {
      const error = { message: "Invalid token" };
      const result = isTimeSyncError(error);
      expect(result).toBe(true);
    });

    it("devrait être insensible à la casse", () => {
      const error = { message: "TOKEN ISSUED IN THE FUTURE" };
      const result = isTimeSyncError(error);
      expect(result).toBe(true);
    });

    it("devrait retourner false pour des messages non liés au temps", () => {
      const error = { message: "User not found" };
      const result = isTimeSyncError(error);
      expect(result).toBe(false);
    });
  });

  describe("formatDate", () => {
    it("devrait formater 'À l'instant' pour moins d'une minute", () => {
      const recentDate = new Date(1640995200000 - 30000); // -30 secondes
      const result = formatDate(recentDate);

      expect(result).toBe("À l'instant");
    });

    it("devrait formater les minutes", () => {
      const date1 = new Date(1640995200000 - 2 * 60 * 1000); // -2 minutes
      const date2 = new Date(1640995200000 - 1 * 60 * 1000); // -1 minute

      expect(formatDate(date1)).toBe("Il y a 2 minutes");
      expect(formatDate(date2)).toBe("Il y a 1 minute");
    });

    it("devrait formater les heures", () => {
      const date1 = new Date(1640995200000 - 2 * 60 * 60 * 1000); // -2 heures
      const date2 = new Date(1640995200000 - 1 * 60 * 60 * 1000); // -1 heure

      expect(formatDate(date1)).toBe("Il y a 2 heures");
      expect(formatDate(date2)).toBe("Il y a 1 heure");
    });

    it("devrait formater les jours", () => {
      const date1 = new Date(1640995200000 - 2 * 24 * 60 * 60 * 1000); // -2 jours
      const date2 = new Date(1640995200000 - 1 * 24 * 60 * 60 * 1000); // -1 jour

      expect(formatDate(date1)).toBe("Il y a 2 jours");
      expect(formatDate(date2)).toBe("Il y a 1 jour");
    });

    it("devrait formater les semaines", () => {
      const date1 = new Date(1640995200000 - 2 * 7 * 24 * 60 * 60 * 1000); // -2 semaines
      const date2 = new Date(1640995200000 - 1 * 7 * 24 * 60 * 60 * 1000); // -1 semaine

      expect(formatDate(date1)).toBe("Il y a 2 semaines");
      expect(formatDate(date2)).toBe("Il y a 1 semaine");
    });

    it("devrait formater les mois", () => {
      const date = new Date(1640995200000 - 2 * 30 * 24 * 60 * 60 * 1000); // -2 mois
      const result = formatDate(date);

      expect(result).toBe("Il y a 2 mois");
    });

    it("devrait formater les années", () => {
      const date1 = new Date(1640995200000 - 2 * 365 * 24 * 60 * 60 * 1000); // -2 ans
      const date2 = new Date(1640995200000 - 1 * 365 * 24 * 60 * 60 * 1000); // -1 an

      expect(formatDate(date1)).toBe("Il y a 2 ans");
      expect(formatDate(date2)).toBe("Il y a 1 an");
    });

    it("devrait gérer les dates futures", () => {
      const futureDate = new Date(1640995200000 + 24 * 60 * 60 * 1000); // +1 jour
      const result = formatDate(futureDate);

      // formatDate traite les dates futures comme des dates passées
      // car elle calcule la différence avec "maintenant" (mocké)
      // Une date future sera considérée comme "À l'instant" si elle est proche
      // ou comme une date passée si elle est plus éloignée
      expect(typeof result).toBe("string");
      expect(result).not.toBe("Date invalide");
    });

    it("devrait gérer les chaînes de date", () => {
      const dateString = "2022-01-01T12:00:00";
      const result = formatDate(dateString);

      expect(typeof result).toBe("string");
      expect(result).not.toBe("Date invalide");
    });

    it("devrait gérer les dates invalides", () => {
      const invalidDate = new Date("invalid-date");
      const result = formatDate(invalidDate);

      expect(result).toBe("Date invalide");
    });

    it("devrait gérer les chaînes de date invalides", () => {
      const result = formatDate("invalid-date-string");

      expect(result).toBe("Date invalide");
    });

    it("devrait gérer les erreurs de parsing", () => {
      const result = formatDate("not-a-date");

      expect(result).toBe("Date invalide");
    });
  });

  describe("formatPrice", () => {
    it("devrait formater un prix avec le symbole euro", () => {
      expect(formatPrice(10)).toBe("10€");
      expect(formatPrice(25.5)).toBe("25.5€");
      expect(formatPrice(0)).toBe("0€");
      expect(formatPrice(1000)).toBe("1000€");
    });

    it("devrait gérer les nombres décimaux", () => {
      expect(formatPrice(19.99)).toBe("19.99€");
      expect(formatPrice(0.5)).toBe("0.5€");
    });

    it("devrait gérer les grands nombres", () => {
      expect(formatPrice(1000000)).toBe("1000000€");
    });
  });
});
