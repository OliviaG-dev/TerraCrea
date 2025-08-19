import { describe, it, expect, beforeEach, vi } from "vitest";
import { FavoritesApi } from "../../services/favoritesApi";
import { CreationsApi } from "../../services/creationsApi";
import { CreationWithArtisan } from "../../types/Creation";

// Mock de CreationsApi
vi.mock("../../services/creationsApi", () => ({
  CreationsApi: {
    getUserFavorites: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
    isFavorite: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}));

describe("FavoritesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserFavorites", () => {
    it("should return user favorites successfully", async () => {
      const mockFavorites: CreationWithArtisan[] = [
        {
          id: "creation-1",
          title: "Bracelet en argent",
          description: "Magnifique bracelet",
          price: 150,
          imageUrl: "https://example.com/image1.jpg",
          category: "jewelry" as any,
          artisanId: "artisan-1",
          materials: ["argent"],
          isAvailable: true,
          rating: 4.5,
          reviewCount: 10,
          createdAt: "2024-01-01T00:00:00Z",
          tags: ["bijoux"],
          artisan: {
            id: "artisan-1",
            artisanProfile: {
              businessName: "Artisan 1",
              verified: true,
            },
          } as any,
        },
        {
          id: "creation-2",
          title: "Vase en céramique",
          description: "Vase élégant",
          price: 80,
          imageUrl: "https://example.com/image2.jpg",
          category: "pottery" as any,
          artisanId: "artisan-2",
          materials: ["céramique"],
          isAvailable: true,
          rating: 4.0,
          reviewCount: 5,
          createdAt: "2024-01-02T00:00:00Z",
          tags: ["poterie"],
          artisan: {
            id: "artisan-2",
            artisanProfile: {
              businessName: "Artisan 2",
              verified: false,
            },
          } as any,
        },
      ];

      (CreationsApi.getUserFavorites as vi.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await FavoritesApi.getUserFavorites();

      expect(result).toEqual(mockFavorites);
      expect(result).toHaveLength(2);
      expect(CreationsApi.getUserFavorites).toHaveBeenCalledTimes(1);
    });

    it("should throw error when CreationsApi fails", async () => {
      const mockError = new Error("Database error");
      (CreationsApi.getUserFavorites as vi.Mock).mockRejectedValue(mockError);

      await expect(FavoritesApi.getUserFavorites()).rejects.toThrow(
        "Impossible de récupérer vos favoris"
      );
      expect(CreationsApi.getUserFavorites).toHaveBeenCalledTimes(1);
    });
  });

  describe("addToFavorites", () => {
    it("should add creation to favorites successfully", async () => {
      (CreationsApi.addToFavorites as vi.Mock).mockResolvedValue(true);

      const result = await FavoritesApi.addToFavorites("creation-123");

      expect(result).toBe(true);
      expect(CreationsApi.addToFavorites).toHaveBeenCalledWith("creation-123");
    });

    it("should throw error when CreationsApi fails", async () => {
      const mockError = new Error("Database error");
      (CreationsApi.addToFavorites as vi.Mock).mockRejectedValue(mockError);

      await expect(FavoritesApi.addToFavorites("creation-123")).rejects.toThrow(
        "Impossible d'ajouter aux favoris"
      );
      expect(CreationsApi.addToFavorites).toHaveBeenCalledWith("creation-123");
    });
  });

  describe("removeFromFavorites", () => {
    it("should remove creation from favorites successfully", async () => {
      (CreationsApi.removeFromFavorites as vi.Mock).mockResolvedValue(true);

      const result = await FavoritesApi.removeFromFavorites("creation-123");

      expect(result).toBe(true);
      expect(CreationsApi.removeFromFavorites).toHaveBeenCalledWith(
        "creation-123"
      );
    });

    it("should throw error when CreationsApi fails", async () => {
      const mockError = new Error("Database error");
      (CreationsApi.removeFromFavorites as vi.Mock).mockRejectedValue(
        mockError
      );

      await expect(
        FavoritesApi.removeFromFavorites("creation-123")
      ).rejects.toThrow("Impossible de retirer des favoris");
      expect(CreationsApi.removeFromFavorites).toHaveBeenCalledWith(
        "creation-123"
      );
    });
  });

  describe("isFavorite", () => {
    it("should return true when creation is favorite", async () => {
      (CreationsApi.isFavorite as vi.Mock).mockResolvedValue(true);

      const result = await FavoritesApi.isFavorite("creation-123");

      expect(result).toBe(true);
      expect(CreationsApi.isFavorite).toHaveBeenCalledWith("creation-123");
    });

    it("should return false when creation is not favorite", async () => {
      (CreationsApi.isFavorite as vi.Mock).mockResolvedValue(false);

      const result = await FavoritesApi.isFavorite("creation-123");

      expect(result).toBe(false);
      expect(CreationsApi.isFavorite).toHaveBeenCalledWith("creation-123");
    });

    it("should return false when CreationsApi fails", async () => {
      const mockError = new Error("Database error");
      (CreationsApi.isFavorite as vi.Mock).mockRejectedValue(mockError);

      const result = await FavoritesApi.isFavorite("creation-123");

      expect(result).toBe(false);
      expect(CreationsApi.isFavorite).toHaveBeenCalledWith("creation-123");
    });
  });

  describe("toggleFavorite", () => {
    it("should toggle favorite status successfully", async () => {
      (CreationsApi.toggleFavorite as vi.Mock).mockResolvedValue(true);

      const result = await FavoritesApi.toggleFavorite("creation-123");

      expect(result).toBe(true);
      expect(CreationsApi.toggleFavorite).toHaveBeenCalledWith("creation-123");
    });

    it("should throw error when CreationsApi fails", async () => {
      const mockError = new Error("Database error");
      (CreationsApi.toggleFavorite as vi.Mock).mockRejectedValue(mockError);

      await expect(FavoritesApi.toggleFavorite("creation-123")).rejects.toThrow(
        "Impossible de modifier les favoris"
      );
      expect(CreationsApi.toggleFavorite).toHaveBeenCalledWith("creation-123");
    });
  });

  describe("getFavoritesCount", () => {
    it("should return correct favorites count", async () => {
      const mockFavorites: CreationWithArtisan[] = [
        {
          id: "creation-1",
          title: "Bracelet en argent",
          description: "Magnifique bracelet",
          price: 150,
          imageUrl: "https://example.com/image1.jpg",
          category: "jewelry" as any,
          artisanId: "artisan-1",
          materials: ["argent"],
          isAvailable: true,
          rating: 4.5,
          reviewCount: 10,
          createdAt: "2024-01-01T00:00:00Z",
          tags: ["bijoux"],
          artisan: {
            id: "artisan-1",
            artisanProfile: {
              businessName: "Artisan 1",
              verified: true,
            },
          } as any,
        },
        {
          id: "creation-2",
          title: "Vase en céramique",
          description: "Vase élégant",
          price: 80,
          imageUrl: "https://example.com/image2.jpg",
          category: "pottery" as any,
          artisanId: "artisan-2",
          materials: ["céramique"],
          isAvailable: true,
          rating: 4.0,
          reviewCount: 5,
          createdAt: "2024-01-02T00:00:00Z",
          tags: ["poterie"],
          artisan: {
            id: "artisan-2",
            artisanProfile: {
              businessName: "Artisan 2",
              verified: false,
            },
          } as any,
        },
        {
          id: "creation-3",
          title: "Table en bois",
          description: "Table rustique",
          price: 300,
          imageUrl: "https://example.com/image3.jpg",
          category: "woodwork" as any,
          artisanId: "artisan-3",
          materials: ["bois"],
          isAvailable: true,
          rating: 4.8,
          reviewCount: 15,
          createdAt: "2024-01-03T00:00:00Z",
          tags: ["mobilier"],
          artisan: {
            id: "artisan-3",
            artisanProfile: {
              businessName: "Artisan 3",
              verified: true,
            },
          } as any,
        },
      ];

      (CreationsApi.getUserFavorites as vi.Mock).mockResolvedValue(
        mockFavorites
      );

      const result = await FavoritesApi.getFavoritesCount();

      expect(result).toBe(3);
      expect(CreationsApi.getUserFavorites).toHaveBeenCalledTimes(1);
    });

    it("should return 0 when no favorites", async () => {
      (CreationsApi.getUserFavorites as vi.Mock).mockResolvedValue([]);

      const result = await FavoritesApi.getFavoritesCount();

      expect(result).toBe(0);
      expect(CreationsApi.getUserFavorites).toHaveBeenCalledTimes(1);
    });

    it("should return 0 when CreationsApi fails", async () => {
      const mockError = new Error("Database error");
      (CreationsApi.getUserFavorites as vi.Mock).mockRejectedValue(mockError);

      const result = await FavoritesApi.getFavoritesCount();

      expect(result).toBe(0);
      expect(CreationsApi.getUserFavorites).toHaveBeenCalledTimes(1);
    });
  });

  describe("integration scenarios", () => {
    it("should handle multiple favorite operations in sequence", async () => {
      // Setup mocks pour la séquence d'opérations
      (CreationsApi.addToFavorites as vi.Mock).mockResolvedValue(true);
      (CreationsApi.removeFromFavorites as vi.Mock).mockResolvedValue(true);

      // 1. Ajouter aux favoris
      const addResult = await FavoritesApi.addToFavorites("creation-123");
      expect(addResult).toBe(true);

      // 2. Vérifier si c'est un favori (après ajout)
      (CreationsApi.isFavorite as vi.Mock).mockResolvedValue(true);
      const isFavoriteResult = await FavoritesApi.isFavorite("creation-123");
      expect(isFavoriteResult).toBe(true);

      // 3. Retirer des favoris
      const removeResult = await FavoritesApi.removeFromFavorites(
        "creation-123"
      );
      expect(removeResult).toBe(true);

      // 4. Vérifier que ce n'est plus un favori (après suppression)
      (CreationsApi.isFavorite as vi.Mock).mockResolvedValue(false);
      const isFavoriteAfterRemove = await FavoritesApi.isFavorite(
        "creation-123"
      );
      expect(isFavoriteAfterRemove).toBe(false);

      // Vérifier que tous les appels ont été faits
      expect(CreationsApi.addToFavorites).toHaveBeenCalledWith("creation-123");
      expect(CreationsApi.isFavorite).toHaveBeenCalledWith("creation-123");
      expect(CreationsApi.removeFromFavorites).toHaveBeenCalledWith(
        "creation-123"
      );

      // Vérifier le nombre total d'appels
      expect(CreationsApi.isFavorite).toHaveBeenCalledTimes(2);
    });

    it("should handle error scenarios gracefully", async () => {
      // Test que les erreurs sont correctement encapsulées avec des messages personnalisés
      const mockError = new Error("Database connection failed");

      (CreationsApi.getUserFavorites as vi.Mock).mockRejectedValue(mockError);
      (CreationsApi.addToFavorites as vi.Mock).mockRejectedValue(mockError);
      (CreationsApi.removeFromFavorites as vi.Mock).mockRejectedValue(
        mockError
      );
      (CreationsApi.toggleFavorite as vi.Mock).mockRejectedValue(mockError);

      // Test des messages d'erreur
      await expect(FavoritesApi.getUserFavorites()).rejects.toThrow(
        "Impossible de récupérer vos favoris"
      );

      await expect(FavoritesApi.addToFavorites("creation-123")).rejects.toThrow(
        "Impossible d'ajouter aux favoris"
      );

      await expect(
        FavoritesApi.removeFromFavorites("creation-123")
      ).rejects.toThrow("Impossible de retirer des favoris");

      await expect(FavoritesApi.toggleFavorite("creation-123")).rejects.toThrow(
        "Impossible de modifier les favoris"
      );
    });
  });
});
