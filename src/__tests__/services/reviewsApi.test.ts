import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReviewsApi } from "../../services/reviewsApi";
import { supabase } from "../../services/supabase";

// Mock de Supabase
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("ReviewsApi", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getUser as vi.Mock).mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("getUserReview", () => {
    it("should return user review when it exists", async () => {
      const mockFrom = vi.fn().mockReturnValue({
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
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBe("Great creation!");
      expect(supabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should return null when no review exists", async () => {
      const mockFrom = vi.fn().mockReturnValue({
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
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
    });

    it("should return null when user is not authenticated", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("should return null when PGRST116 error occurs (no rows)", async () => {
      const mockFrom = vi.fn().mockReturnValue({
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
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
    });

    it("should handle fallback query successfully", async () => {
      // Premier appel échoue avec une erreur
      const mockFrom1 = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockRejectedValue(new Error("Query failed")),
            }),
          }),
        }),
      });

      // Deuxième appel (fallback) réussit
      const mockFrom2 = vi.fn().mockReturnValue({
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
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockFrom1)
        .mockReturnValueOnce(mockFrom2);

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBe("Fallback comment");
    });

    it("should return null when both queries fail", async () => {
      // Premier appel échoue
      const mockFrom1 = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockRejectedValue(new Error("Query failed")),
            }),
          }),
        }),
      });

      // Deuxième appel (fallback) échoue aussi
      const mockFrom2 = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error("Fallback failed")),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockFrom1)
        .mockReturnValueOnce(mockFrom2);

      const result = await ReviewsApi.getUserReview("creation-123");

      expect(result).toBeNull();
    });
  });

  describe("saveUserReview", () => {
    it("should create new review successfully", async () => {
      // Mock pour la vérification de création
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock pour la vérification d'avis existant
      const mockReviewsFrom = vi.fn().mockReturnValue({
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
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews (select)
        .mockReturnValueOnce(mockReviewsFrom); // user_reviews (insert)

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("creations");
      expect(supabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should update existing review successfully", async () => {
      // Mock pour la vérification de création
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock pour la vérification d'avis existant
      const mockReviewsFrom = vi.fn().mockReturnValue({
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
      });

      (supabase.from as vi.Mock)
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
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "user-123" },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockCreationsFrom);

      await expect(
        ReviewsApi.saveUserReview("creation-123", "My own creation")
      ).rejects.toThrow("Vous ne pouvez pas commenter vos propres créations");
    });

    it("should return false when user is not authenticated", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(false);
    });

    it("should return false when creation check fails", async () => {
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Creation not found"),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockCreationsFrom);

      const result = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );

      expect(result).toBe(false);
    });

    it("should return false when insert fails", async () => {
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      });

      const mockReviewsFrom = vi.fn().mockReturnValue({
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
          error: new Error("Insert failed"),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockCreationsFrom)
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

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toEqual(mockReviews);
      expect(supabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should return empty array when no reviews", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toEqual([]);
    });

    it("should handle fallback query when main query fails", async () => {
      // Premier appel échoue
      const mockFrom1 = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Main query failed"),
            }),
          }),
        }),
      });

      // Deuxième appel (fallback) réussit
      const mockFrom2 = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ comment: "Fallback review" }],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockFrom1)
        .mockReturnValueOnce(mockFrom2);

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toEqual([{ comment: "Fallback review" }]);
    });

    it("should generate fallback usernames when users query fails", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
        { id: "review-2", comment: "Amazing!", user_id: "user-2" },
      ];

      // Mock pour les avis
      const mockReviewsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      });

      // Mock pour les utilisateurs (échoue)
      const mockUsersFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            mockResolvedValue: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Users query failed"),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews
        .mockReturnValueOnce(mockUsersFrom); // users

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toEqual(mockReviews);
      // Les surnoms devraient être générés automatiquement
      expect(result[0].userNickname).toBeDefined();
      expect(result[1].userNickname).toBeDefined();
    });

    it("should handle empty users array gracefully", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
      ];

      // Mock pour les avis
      const mockReviewsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      });

      // Mock pour les utilisateurs (retourne un tableau vide)
      const mockUsersFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            mockResolvedValue: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews
        .mockReturnValueOnce(mockUsersFrom); // users

      const result = await ReviewsApi.getCreationReviews("creation-123");

      expect(result).toEqual(mockReviews);
      // Les surnoms devraient être générés automatiquement
      expect(result[0].userNickname).toBeDefined();
    });
  });

  describe("deleteUserReview", () => {
    it("should delete user review successfully", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.deleteUserReview("creation-123");

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("user_reviews");
    });

    it("should return false when user is not authenticated", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await ReviewsApi.deleteUserReview("creation-123");

      expect(result).toBe(false);
    });

    it("should return false when deletion fails", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              error: new Error("Deletion failed"),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await ReviewsApi.deleteUserReview("creation-123");

      expect(result).toBe(false);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete review workflow", async () => {
      // Mock pour la vérification de création
      const mockCreationsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { artisan_id: "other-user-123" },
              error: null,
            }),
          }),
        }),
      });

      // Mock pour les avis
      const mockReviewsFrom = vi.fn().mockReturnValue({
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
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockReviewsFrom) // user_reviews (select)
        .mockReturnValueOnce(mockReviewsFrom); // user_reviews (insert)

      // Créer un avis
      const saveResult = await ReviewsApi.saveUserReview(
        "creation-123",
        "Great creation!"
      );
      expect(saveResult).toBe(true);

      // Récupérer l'avis
      const mockGetFrom = vi.fn().mockReturnValue({
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

      (supabase.from as vi.Mock).mockReturnValue(mockGetFrom);

      const review = await ReviewsApi.getUserReview("creation-123");
      expect(review).toBe("Great creation!");
    });

    it("should handle multiple reviews for same creation", async () => {
      const mockReviews = [
        { id: "review-1", comment: "Great!", user_id: "user-1" },
        { id: "review-2", comment: "Amazing!", user_id: "user-2" },
        { id: "review-3", comment: "Wonderful!", user_id: "user-3" },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockReviews,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const reviews = await ReviewsApi.getCreationReviews("creation-123");

      expect(reviews).toHaveLength(3);
      expect(reviews[0].comment).toBe("Great!");
      expect(reviews[1].comment).toBe("Amazing!");
      expect(reviews[2].comment).toBe("Wonderful!");
    });
  });
});
