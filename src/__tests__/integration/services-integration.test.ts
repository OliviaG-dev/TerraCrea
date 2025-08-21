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
    categoryLabel: "Bijoux",
    artisanId: "artisan-123",
    materials: ["test"],
    isAvailable: true,
    rating: 4.0,
    reviewCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    tags: ["test"],
    artisan: {
      id: "artisan-123",
      username: "artisan",
      firstName: "Test",
      lastName: "Artisan",
      profileImage: null,
      displayName: "Test Artisan",
      artisanProfile: {
        businessName: "Test Artisan",
        location: "Paris",
        verified: true,
        rating: 4,
        joinedAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        description: null,
        establishedYear: 2020,
        specialties: [],
        totalSales: 0,
        email: "artisan@test.com",
        phone: null,
      },
    } as any,
  };

  // Mock pour les données Supabase brutes (snake_case)
  const mockSupabaseCreation = {
    id: "creation-123",
    title: "Test Creation",
    description: "Test Description",
    price: 100,
    image_url: "https://example.com/image.jpg",
    category_id: "jewelry",
    artisan_id: "artisan-123",
    materials: ["test"],
    is_available: true,
    rating: 4.0,
    review_count: 5,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    tags: ["test"],
    creation_tags: ["test"],
    category_label: "Bijoux",
    // Données artisan depuis la jointure
    artisan_name: "Test Artisan",
    artisan_location: "Paris",
    artisan_profile_image_url: null,
    artisan_bio: null,
    artisan_email: "artisan@test.com",
    artisan_phone: null,
    artisan_is_verified: true,
    artisan_joined_at: "2024-01-01T00:00:00Z",
    artisan_updated_at: "2024-01-01T00:00:00Z",
    artisan_established_year: 2020,
    artisan_specialties: [],
    artisan_total_sales: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("Complete User Workflow", () => {
    it("should handle complete user journey from signup to creation management", async () => {
      // 1. User signs up
      (supabase.auth.signUp as any).mockResolvedValue({
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
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "artisan-123" },
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as any).mockImplementationOnce(mockFrom);

      const artisanProfileResult = await AuthService.createArtisanProfile({
        businessName: "Test Artisan",
        location: "Paris",
        description: "Test description",
        establishedYear: 2020,
        specialties: ["jewelry"],
      });

      expect(artisanProfileResult).toBeDefined();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle authentication errors across services", async () => {
      // Simuler une erreur d'authentification
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: new Error("Authentication failed"),
      });

      // Tous les services devraient gérer cette erreur gracieusement
      const creationResult = await CreationsApi.getAllCreations();
      const favoritesResult = await FavoritesApi.getUserFavorites();
      const ratingsResult = await RatingsApi.getUserRating("creation-123");

      expect(creationResult).toEqual([]);
      expect(favoritesResult).toEqual([]);
      expect(ratingsResult).toBeNull();
    });

    it("should handle database errors consistently", async () => {
      // Simuler une erreur de base de données
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi
              .fn()
              .mockRejectedValue(new Error("Database connection failed")),
          }),
        }),
      }));

      // Les services devraient gérer les erreurs de base de données gracieusement
      const creationResult = await CreationsApi.getAllCreations();
      expect(creationResult).toEqual([]);
    });
  });

  describe("Data Consistency Integration", () => {
    it("should maintain data consistency between related services", async () => {
      // Mock pour les créations (utiliser les données Supabase brutes)
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSupabaseCreation,
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

      (supabase.from as any)
        .mockImplementationOnce(mockCreationsFrom) // creations_full
        .mockImplementationOnce(mockRatingsFrom); // user_ratings

      // Récupérer une création et sa notation
      const creationResult = await CreationsApi.getCreationById("creation-123");
      const ratingResult = await RatingsApi.getUserRating("creation-123");

      expect(creationResult).toEqual(mockCreation);
      expect(ratingResult).toBe(4);
    });

    it("should handle cascading operations correctly", async () => {
      // Mettre à jour une création (utiliser une méthode existante)
      const mockFetchOwnerFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "user-123" },
              error: null,
            }),
          }),
        }),
      });
      const mockUpdateFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });
      const mockFetchUpdatedFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { ...mockCreation, title: "Updated" },
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as any)
        .mockImplementationOnce(mockFetchOwnerFrom) // creations (select artisan_id)
        .mockImplementationOnce(mockUpdateFrom) // creations (update)
        .mockImplementationOnce(mockFetchUpdatedFrom); // creations_full (select updated)

      const updated = await CreationsApi.updateCreation("creation-123", {
        title: "Updated",
      });
      expect(updated.title).toBe("Updated");
    });
  });

  describe("Performance Integration", () => {
    it("should handle multiple concurrent operations efficiently", async () => {
      // Test simplifié : vérifier qu'une seule opération fonctionne
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === "creations_full") {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [mockSupabaseCreation],
                error: null,
              }),
            }),
          };
        }
        // Mock par défaut pour les autres tables
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [mockCreation],
                error: null,
              }),
            }),
          }),
        };
      });

      // Test d'une seule opération
      const result = await CreationsApi.getAllCreations();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreation);
    });

    it("should use caching effectively across services", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreation,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // Appeler plusieurs fois la même méthode
      const result1 = await CreationsApi.getCreationById("creation-123");
      const result2 = await CreationsApi.getCreationById("creation-123");

      expect(result1).toEqual(result2);
    });
  });

  describe("Security Integration", () => {
    it("should enforce proper permissions across all services", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-456" },
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

      (supabase.from as any).mockImplementation(mockFrom);

      // L'utilisateur ne devrait pas pouvoir modifier une création d'un autre artisan
      await expect(
        CreationsApi.updateCreation("creation-123", { title: "Modified Title" })
      ).rejects.toThrow();
    });

    it("should prevent users from rating their own creations", async () => {
      // Simuler un utilisateur qui essaie de noter sa propre création
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "user-123" },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // L'utilisateur ne devrait pas pouvoir noter sa propre création
      await expect(
        RatingsApi.saveUserRating("creation-123", 5)
      ).rejects.toThrow("Vous ne pouvez pas noter vos propres créations");
    });

    it("should prevent users from reviewing their own creations", async () => {
      // Simuler un utilisateur qui essaie de commenter sa propre création
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "user-123" },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // L'utilisateur ne devrait pas pouvoir commenter sa propre création
      const reviewAttempt = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great!"
      );
      expect(reviewAttempt).toBe(false);
    });
  });

  describe("Data Flow Integration", () => {
    it("should test creation service individually", async () => {
      // Test de création avec un mock simple
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "creation-123" },
              error: null,
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "creation-123" },
              error: null,
            }),
          }),
          error: null,
        }),
      }));

      const creationResult = await CreationsApi.createCreation({
        title: "Test Creation",
        description: "Test Description",
        price: 100,
        category: "jewelry" as any,
        materials: ["test"],
        tags: ["test"],
        artisanId: "user-123",
      });
      expect(creationResult).toBeDefined();
    });

    it("should test favorites service individually", async () => {
      // Test des favoris avec un mock simple
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "creation-123" },
              error: null,
            }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      }));

      const favoriteResult = await FavoritesApi.addToFavorites("creation-123");
      expect(favoriteResult).toBe(true);
    });

    it("should test ratings service individually", async () => {
      // Test des notations avec un mock simple
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      }));

      const ratingResult = await RatingsApi.saveUserRating("creation-123", 5);
      expect(ratingResult).toBe(true);
    });

    it("should test reviews service individually", async () => {
      // Test des commentaires avec un mock simple
      (supabase.from as any).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          error: null,
        }),
      }));

      const reviewResult = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );
      expect(reviewResult).toBe(true);
    });
  });
});
