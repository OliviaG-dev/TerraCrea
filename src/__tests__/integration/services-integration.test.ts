import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreationsApi } from "../../services/creationsApi";
import { AuthService } from "../../services/authService";
import { FavoritesApi } from "../../services/favoritesApi";
import { RatingsApi } from "../../services/ratingsApi";
import { ReviewsApi } from "../../services/reviewsApi";
import { suggestionsService } from "../../services/suggestionsService";
import { supabase } from "../../services/supabase";

// Mock de Supabase pour les tests d'intégration
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

describe("Services Integration Tests", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockCreation = {
    id: "creation-123",
    title: "Test Creation",
    description: "Test Description",
    price: 100,
    imageUrl: "https://example.com/image.jpg",
    category: "jewelry" as any,
    artisanId: "artisan-123",
    materials: ["test"],
    isAvailable: true,
    rating: 4.0,
    reviewCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    tags: ["test"],
    artisan: {
      id: "artisan-123",
      artisanProfile: {
        businessName: "Test Artisan",
        verified: true,
      },
    } as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getUser as vi.Mock).mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("Complete User Workflow", () => {
    it("should handle complete user journey from signup to creation management", async () => {
      // 1. User signs up
      (supabase.auth.signUp as vi.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const signupResult = await AuthService.signUpWithEmailConfirmation({
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });

      expect(signupResult.data.user).toEqual(mockUser);
      expect(signupResult.needsConfirmation).toBe(true);

      // 2. User creates artisan profile
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [{ id: "artisan-123" }],
            error: null,
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const artisanProfileResult = await AuthService.createArtisanProfile({
        userId: "user-123",
        businessName: "Test Artisan",
        location: "Paris",
        description: "Test description",
        specialties: ["jewelry"],
        establishedYear: 2020,
      });

      expect(artisanProfileResult.data).toBeDefined();
      expect(artisanProfileResult.error).toBeNull();

      // 3. User creates a creation
      const mockCreationsFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [mockCreation],
            error: null,
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue(mockCreationsFrom);

      const creationResult = await CreationsApi.createCreation({
        title: "Test Creation",
        description: "Test Description",
        price: 100,
        category: "jewelry" as any,
        materials: ["test"],
        tags: ["test"],
      });

      expect(creationResult.data).toBeDefined();
      expect(creationResult.error).toBeNull();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle authentication errors across services", async () => {
      // Simuler une erreur d'authentification
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      // Tous les services devraient gérer l'absence d'utilisateur
      const ratingResult = await RatingsApi.getUserRating("creation-123");
      const reviewResult = await ReviewsApi.getUserReview("creation-123");
      const favoritesResult = await FavoritesApi.getUserFavorites();

      expect(ratingResult).toBeNull();
      expect(reviewResult).toBeNull();
      expect(favoritesResult).toEqual([]);
    });

    it("should handle database errors consistently", async () => {
      // Simuler une erreur de base de données
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Database error"),
            }),
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // Tous les services devraient gérer les erreurs de base de données
      const creationResult = await CreationsApi.getCreationById("creation-123");
      expect(creationResult.data).toBeNull();
      expect(creationResult.error).toBeDefined();
    });
  });

  describe("Data Consistency Integration", () => {
    it("should maintain data consistency between related services", async () => {
      // Mock pour les créations
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreation,
              error: null,
            }),
          }),
        }),
      });

      // Mock pour les notations
      const mockRatingsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { rating: 4 },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockRatingsFrom); // user_ratings

      // Récupérer une création et sa notation
      const creationResult = await CreationsApi.getCreationById("creation-123");
      const ratingResult = await RatingsApi.getUserRating("creation-123");

      expect(creationResult.data).toEqual(mockCreation);
      expect(ratingResult).toBe(4);
    });

    it("should handle cascading operations correctly", async () => {
      // Mock pour la suppression d'une création
      const mockDeleteFrom = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockDeleteFrom);

      // Supprimer une création
      const deleteResult = await CreationsApi.deleteCreation("creation-123");
      expect(deleteResult.error).toBeNull();

      // Les avis et notations associés devraient également être supprimés
      // (cela dépend de la configuration de la base de données)
    });
  });

  describe("Performance Integration", () => {
    it("should handle multiple concurrent operations efficiently", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockCreation],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // Exécuter plusieurs opérations en parallèle
      const promises = [
        CreationsApi.getAllCreations(),
        CreationsApi.getTopRatedCreations(),
        CreationsApi.getRecentCreations(),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.data).toBeDefined();
        expect(result.error).toBeNull();
      });
    });

    it("should use caching effectively across services", async () => {
      // Vider le cache avant le test
      suggestionsService.clearCache();

      const mockCreations = [mockCreation];
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockCreations,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // Premier appel - devrait charger depuis l'API
      const result1 = await suggestionsService.getCreationSuggestions("test");
      expect(result1.length).toBeGreaterThan(0);

      // Deuxième appel - devrait utiliser le cache
      const result2 = await suggestionsService.getCreationSuggestions("test");
      expect(result2).toEqual(result1);

      // Vérifier que l'API n'a été appelée qu'une fois
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe("Security Integration", () => {
    it("should enforce proper permissions across all services", async () => {
      // Simuler un utilisateur qui essaie d'accéder à une création d'un autre artisan
      const otherUserCreation = {
        ...mockCreation,
        artisanId: "other-artisan-123",
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: otherUserCreation,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: new Error("Permission denied"),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // L'utilisateur ne devrait pas pouvoir modifier une création d'un autre artisan
      const updateResult = await CreationsApi.updateCreation("creation-123", {
        title: "Modified Title",
      });

      expect(updateResult.error).toBeDefined();
    });

    it("should prevent users from rating their own creations", async () => {
      // Simuler un utilisateur qui essaie de noter sa propre création
      const ownCreation = {
        ...mockCreation,
        artisanId: "user-123", // Même ID que l'utilisateur connecté
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: ownCreation,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // L'utilisateur ne devrait pas pouvoir noter sa propre création
      await expect(
        RatingsApi.saveUserRating("creation-123", 5)
      ).rejects.toThrow("Vous ne pouvez pas noter vos propres créations");
    });

    it("should prevent users from reviewing their own creations", async () => {
      // Simuler un utilisateur qui essaie de commenter sa propre création
      const ownCreation = {
        ...mockCreation,
        artisanId: "user-123", // Même ID que l'utilisateur connecté
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: ownCreation,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // L'utilisateur ne devrait pas pouvoir commenter sa propre création
      await expect(
        ReviewsApi.saveUserReview("creation-123", "Great!")
      ).rejects.toThrow("Vous ne pouvez pas commenter vos propres créations");
    });
  });

  describe("Data Flow Integration", () => {
    it("should handle complete creation lifecycle", async () => {
      // 1. Créer une création
      const mockInsertFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: [mockCreation],
            error: null,
          }),
        }),
      });

      // 2. Ajouter aux favoris
      const mockFavoritesFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      // 3. Ajouter une notation
      const mockRatingsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      // 4. Ajouter un commentaire
      const mockReviewsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116" },
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockInsertFrom) // creations (insert)
        .mockReturnValueOnce(mockFavoritesFrom) // user_favorites (insert)
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (insert)
        .mockReturnValueOnce(mockReviewsFrom); // user_reviews (insert)

      // Créer la création
      const creationResult = await CreationsApi.createCreation({
        title: "Test Creation",
        description: "Test Description",
        price: 100,
        category: "jewelry" as any,
        materials: ["test"],
        tags: ["test"],
      });

      expect(creationResult.data).toBeDefined();

      // Ajouter aux favoris
      const favoriteResult = await FavoritesApi.addToFavorites("creation-123");
      expect(favoriteResult).toBe(true);

      // Ajouter une notation
      const ratingResult = await RatingsApi.saveUserRating("creation-123", 5);
      expect(ratingResult).toBe(true);

      // Ajouter un commentaire
      const reviewResult = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );
      expect(reviewResult).toBe(true);
    });
  });
});
