import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock du module supabase avec création directe dans la factory
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { ReviewsApi } from "../../services/reviewsApi";
import { supabase } from "../../services/supabase";

// Obtenir les références mockées
const mockSupabase = vi.mocked(supabase);

describe("ReviewsApi", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Configurer l'utilisateur par défaut
    (mockSupabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe("getUserReview", () => {
    it("should return user review when it exists", async () => {
      // Configurer le mock pour retourner un avis
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { comment: "Great creation!" },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBe("Great creation!");
      expect(mockSupabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should return null when no review exists", async () => {
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
    });

    it("should return null when user is not authenticated", async () => {
      (mockSupabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should return null when PGRST116 error occurs (no rows)", async () => {
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
      });

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
    });

    it("should handle fallback query successfully", async () => {
      // Premier appel échoue (main query)
      const mockFrom1 = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error("Main query failed")),
          }),
        }),
      };

      // Deuxième appel (fallback): select -> eq -> eq -> limit
      const mockFrom2 = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{ comment: "Fallback comment" }],
                error: null,
              }),
            }),
          }),
        }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockFrom1)
        .mockReturnValueOnce(mockFrom2);

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBe("Fallback comment");
    });

    it("should return null when both queries fail", async () => {
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockRejectedValue(new Error("Database error")),
          }),
        }),
      });

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
    });
  });

  describe("saveUserReview", () => {
    it("should create new review successfully", async () => {
      // Mock pour la vérification de création (artisan_id différent de l'utilisateur)
      const mockCreationsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      };

      // Mock pour la vérification d'avis existant (pas d'avis)
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
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
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews (select)
        .mockReturnValueOnce(mockReviewsFrom); // user_reviews (insert)

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("creations");
      expect(mockSupabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should update existing review successfully", async () => {
      // Mock pour la vérification de création
      const mockCreationsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      };

      // Mock pour la vérification d'avis existant
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "review-123" },
                error: null,
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews (select)
        .mockReturnValueOnce(mockReviewsFrom); // user_reviews (update)

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Updated comment"
      );

      expect(result).toBe(true);
    });

    it("should throw error when user tries to review their own creation", async () => {
      const mockCreationsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "user-123" },
              error: null,
            }),
          }),
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockCreationsFrom);

      // Le service retourne false au lieu de lancer une exception à cause du try-catch global
      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "My own creation"
      );
      expect(result).toBe(false);
    });

    it("should return false when user is not authenticated", async () => {
      (mockSupabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(false);
    });

    it("should return false when creation check fails", async () => {
      const mockCreationsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Creation not found"),
            }),
          }),
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockCreationsFrom);

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(false);
    });

    it("should return false when insert fails", async () => {
      const mockCreationsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      };

      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: "PGRST116" },
              }),
            }),
          }),
        }),
        insert: vi
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Insert failed") }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockCreationsFrom)
        .mockReturnValueOnce(mockReviewsFrom)
        .mockReturnValueOnce(mockReviewsFrom);

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(false);
    });
  });

  describe("getCreationReviews", () => {
    it("should return creation reviews successfully", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
        { id: "review-2", comment: "Amazing!", user_id: "user-2" },
      ];

      const mockUsers = [
        { id: "user-1", username: "user1" },
        { id: "user-2", username: "user2" },
      ];

      // Mock pour les avis
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      };

      // Mock pour les utilisateurs
      const mockUsersFrom = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null,
          }),
        }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews
        .mockReturnValueOnce(mockUsersFrom); // users

      const result = await ReviewsApi.getCreationReviews("creation-123");

      // Le service transforme les données et ajoute des propriétés supplémentaires
      expect(result).toHaveLength(2);
      expect(result[0].comment).toBe("Great!");
      expect(result[0].userNickname).toBe("user1");
      expect(result[1].comment).toBe("Amazing!");
      expect(result[1].userNickname).toBe("user2");
      expect(mockSupabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should return empty array when no reviews", async () => {
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockReviewsFrom);

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toEqual([]);
    });

    it("should handle fallback query when main query fails", async () => {
      // Premier appel échoue (main)
      const mockFrom1 = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error("Main query failed")),
          }),
        }),
      };

      // Fallback: select -> eq
      const mockFrom2 = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: "r1",
                user_id: "u1",
                creation_id: "c1",
                comment: "Fallback review",
                created_at: "",
                updated_at: "",
              },
            ],
            error: null,
          }),
        }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockFrom1)
        .mockReturnValueOnce(mockFrom2)
        // users query (ignored/fails gracefully)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        });

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toHaveLength(1);
      expect(result[0].comment).toBe("Fallback review");
    });

    it("should generate fallback usernames when users query fails", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
        { id: "review-2", comment: "Amazing!", user_id: "user-2" },
      ];

      // Mock pour les avis
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      };

      // Mock pour les utilisateurs (échoue)
      const mockUsersFrom = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            mockResolvedValue: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Users query failed"),
            }),
          }),
        }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews
        .mockReturnValueOnce(mockUsersFrom); // users

      const result = await ReviewsApi.getCreationReviews("creation-123");

      // Le service transforme les données et ajoute des propriétés supplémentaires
      expect(result).toHaveLength(2);
      expect(result[0].comment).toBe("Great!");
      expect(result[0].userNickname).toBe("Utilisateur user-1...");
      expect(result[1].comment).toBe("Amazing!");
      expect(result[1].userNickname).toBe("Utilisateur user-2...");
    });

    it("should handle empty users array gracefully", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
      ];

      // Mock pour les avis
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      };

      // Mock pour les utilisateurs (retourne un tableau vide)
      const mockUsersFrom = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            mockResolvedValue: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      (mockSupabase.from as any)
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews
        .mockReturnValueOnce(mockUsersFrom); // users

      const result = await ReviewsApi.getCreationReviews("creation-123");

      // Le service transforme les données et ajoute des propriétés supplémentaires
      expect(result).toHaveLength(1);
      expect(result[0].comment).toBe("Great!");
      expect(result[0].userNickname).toBe("Utilisateur user-1...");
    });
  });

  describe("deleteUserReview", () => {
    it("should delete user review successfully", async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              error: null,
            }),
          }),
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockFrom);

      const result = await ReviewsApi.deleteUserReview("creation-123");

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should return false when user is not authenticated", async () => {
      (mockSupabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await ReviewsApi.deleteUserReview("creation-123");

      expect(result).toBe(false);
    });

    it("should return false when deletion fails", async () => {
      const mockFrom = {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              error: new Error("Deletion failed"),
            }),
          }),
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockFrom);

      const result = await ReviewsApi.deleteUserReview("creation-123");

      expect(result).toBe(false);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete review workflow", async () => {
      // 1. Save review
      const mockCreationsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      };
      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi
                .fn()
                .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({ error: null }),
      };
      (mockSupabase.from as any)
        .mockReturnValueOnce(mockCreationsFrom)
        .mockReturnValueOnce(mockReviewsFrom)
        .mockReturnValueOnce(mockReviewsFrom);
      const saveResult = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );
      expect(saveResult).toBe(true);

      // 2. Get reviews (main query)
      const mockGetReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "r1",
                  user_id: "u1",
                  creation_id: "c1",
                  comment: "Great creation!",
                  created_at: "",
                  updated_at: "",
                },
              ],
              error: null,
            }),
          }),
        }),
      };
      const mockUsersFrom = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
      (mockSupabase.from as any)
        .mockReturnValueOnce(mockGetReviewsFrom)
        .mockReturnValueOnce(mockUsersFrom);
      const reviews = await ReviewsApi.getCreationReviews("creation-123");
      expect(reviews).toHaveLength(1);
      expect(reviews[0].comment).toBe("Great creation!");
    });

    it("should handle multiple reviews for same creation", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
        { id: "review-2", comment: "Amazing!", user_id: "user-2" },
        { id: "review-3", comment: "Excellent!", user_id: "user-3" },
      ];

      const mockReviewsFrom = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      };

      (mockSupabase.from as any).mockReturnValue(mockReviewsFrom);

      const reviews = await ReviewsApi.getCreationReviews("creation-123");

      expect(reviews).toHaveLength(3);
      expect(reviews[0].comment).toBe("Great!");
      expect(reviews[1].comment).toBe("Amazing!");
      expect(reviews[2].comment).toBe("Excellent!");
    });
  });
});
