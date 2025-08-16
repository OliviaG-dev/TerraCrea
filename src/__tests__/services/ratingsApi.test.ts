import { describe, it, expect, beforeEach, vi } from "vitest";
import { RatingsApi } from "../../services/ratingsApi";
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

describe("RatingsApi", () => {
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

  describe("getUserRating", () => {
    it("should return user rating when it exists", async () => {
      const mockFrom = vi.fn().mockReturnValue({
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
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBe(4);
      expect(supabase.from).toHaveBeenCalledWith("user_ratings");
    });

    it("should return null when no rating exists", async () => {
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

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
    });

    it("should return null when user is not authenticated", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("should return null when database error occurs", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: new Error("Database error"),
              }),
            }),
          }),
        }),
      });
      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
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

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
    });
  });

  describe("saveUserRating", () => {
    it("should create new rating successfully", async () => {
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

      // Mock pour la vérification de notation existante
      const mockRatingsFrom = vi.fn().mockReturnValue({
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

      // Mock pour la mise à jour de la note moyenne
      const mockUpdateFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (select)
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (insert)
        .mockReturnValueOnce(mockUpdateFrom); // creations (update average)

      const result = await RatingsApi.saveUserRating("creation-123", 5);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("creations");
      expect(supabase.from).toHaveBeenCalledWith("user_ratings");
    });

    it("should update existing rating successfully", async () => {
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

      // Mock pour la vérification de notation existante
      const mockRatingsFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "rating-123" },
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

      // Mock pour la mise à jour de la note moyenne
      const mockUpdateFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      });

      (supabase.from as vi.Mock)
        .mockReturnValueOnce(mockCreationsFrom) // creations
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (select)
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (update)
        .mockReturnValueOnce(mockUpdateFrom); // creations (update average)

      const result = await RatingsApi.saveUserRating("creation-123", 4);

      expect(result).toBe(true);
    });

    it("should throw error when user tries to rate their own creation", async () => {
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
        RatingsApi.saveUserRating("creation-123", 5)
      ).rejects.toThrow("Vous ne pouvez pas noter vos propres créations");
    });

    it("should return false when user is not authenticated", async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await RatingsApi.saveUserRating("creation-123", 5);

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

      const result = await RatingsApi.saveUserRating("creation-123", 5);

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

      const mockRatingsFrom = vi.fn().mockReturnValue({
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
        .mockReturnValueOnce(mockRatingsFrom);

      const result = await RatingsApi.saveUserRating("creation-123", 5);

      expect(result).toBe(false);
    });
  });

  describe("updateCreationAverageRating", () => {
    it("should update creation average rating successfully", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { average_rating: 4.5 },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      // Appeler la méthode privée via une méthode publique qui l'utilise
      const result = await RatingsApi.saveUserRating("creation-123", 5);

      expect(result).toBe(true);
    });
  });

  describe("getCreationRatings", () => {
    it("should return creation ratings successfully", async () => {
      const mockRatings = [
        { id: "rating-1", rating: 5, user_id: "user-1" },
        { id: "rating-2", rating: 4, user_id: "user-2" },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRatings,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await RatingsApi.getCreationRatings("creation-123");

      expect(result).toEqual(mockRatings);
      expect(supabase.from).toHaveBeenCalledWith("user_ratings");
    });

    it("should return empty array when no ratings", async () => {
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

      const result = await RatingsApi.getCreationRatings("creation-123");

      expect(result).toEqual([]);
    });

    it("should return empty array when error occurs", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Database error"),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const result = await RatingsApi.getCreationRatings("creation-123");

      expect(result).toEqual([]);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete rating workflow", async () => {
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
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            error: null,
          }),
        }),
      });

      // Mock pour les notations
      const mockRatingsFrom = vi.fn().mockReturnValue({
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
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (select)
        .mockReturnValueOnce(mockRatingsFrom) // user_ratings (insert)
        .mockReturnValueOnce(mockCreationsFrom); // creations (update average)

      // Créer une notation
      const saveResult = await RatingsApi.saveUserRating("creation-123", 5);
      expect(saveResult).toBe(true);

      // Récupérer la notation
      const mockGetFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { rating: 5 },
                error: null,
              }),
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockGetFrom);

      const rating = await RatingsApi.getUserRating("creation-123");
      expect(rating).toBe(5);
    });

    it("should handle multiple ratings for same creation", async () => {
      const mockRatings = [
        { id: "rating-1", rating: 5, user_id: "user-1" },
        { id: "rating-2", rating: 4, user_id: "user-2" },
        { id: "rating-3", rating: 3, user_id: "user-3" },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRatings,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as vi.Mock).mockReturnValue(mockFrom);

      const ratings = await RatingsApi.getCreationRatings("creation-123");

      expect(ratings).toHaveLength(3);
      expect(ratings[0].rating).toBe(5);
      expect(ratings[1].rating).toBe(4);
      expect(ratings[2].rating).toBe(3);
    });
  });
});
