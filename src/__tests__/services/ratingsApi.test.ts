import { describe, it, expect, beforeEach, vi, MockedFunction } from "vitest";
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

  // Fonction helper pour configurer le mock de supabase.from
  const mockSupabaseFrom = (mockReturnValue: any) => {
    (supabase.from as MockedFunction<typeof supabase.from>).mockReturnValue(
      mockReturnValue
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (
      supabase.auth.getUser as MockedFunction<typeof supabase.auth.getUser>
    ).mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("getUserRating", () => {
    it("should return user rating when it exists", async () => {
      // Mock de la chaîne de méthodes Supabase
      mockSupabaseFrom({
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

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBe(4);
      expect(supabase.from).toHaveBeenCalledWith("user_ratings");
    });

    it("should return null when no rating exists", async () => {
      mockSupabaseFrom({
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

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
    });

    it("should return null when user is not authenticated", async () => {
      (
        supabase.auth.getUser as MockedFunction<typeof supabase.auth.getUser>
      ).mockResolvedValue({
        data: { user: null },
      });

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("should return null when database error occurs", async () => {
      mockSupabaseFrom({
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

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
    });

    it("should return null when PGRST116 error occurs (no rows)", async () => {
      mockSupabaseFrom({
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

      const result = await RatingsApi.getUserRating("creation-123");

      expect(result).toBeNull();
    });
  });

  describe("saveUserRating", () => {
    it("should create new rating successfully", async () => {
      // Mock pour gérer les appels multiples à supabase.from
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "creations" && callCount === 1) {
          // Premier appel à "creations" - vérification artisan
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { artisan_id: "other-user-123" },
                  error: null,
                }),
              }),
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 2) {
          // Deuxième appel à "user_ratings" - select pour vérifier si la notation existe
          return {
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
          } as any;
        } else if (table === "user_ratings" && callCount === 3) {
          // Troisième appel à "user_ratings" - insert
          return {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 4) {
          // Quatrième appel à "user_ratings" - select pour calculer la moyenne
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: [{ rating: 5 }],
                error: null,
              }),
            }),
          } as any;
        } else if (table === "creations" && callCount === 5) {
          // Cinquième appel à "creations" - update de la note moyenne
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          } as any;
        }

        // Fallback
        return {} as any;
      });

      const result = await RatingsApi.saveUserRating("creation-123", 5);

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("creations");
      expect(supabase.from).toHaveBeenCalledWith("user_ratings");
    });

    it("should update existing rating successfully", async () => {
      // Mock pour gérer les appels multiples à supabase.from
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "creations" && callCount === 1) {
          // Premier appel à "creations" - vérification artisan
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { artisan_id: "other-user-123" },
                  error: null,
                }),
              }),
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 2) {
          // Deuxième appel à "user_ratings" - select pour vérifier si la notation existe
          return {
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
          } as any;
        } else if (table === "user_ratings" && callCount === 3) {
          // Troisième appel à "user_ratings" - update
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 4) {
          // Quatrième appel à "user_ratings" - select pour calculer la moyenne
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: [{ rating: 4 }],
                error: null,
              }),
            }),
          } as any;
        } else if (table === "creations" && callCount === 5) {
          // Cinquième appel à "creations" - update de la note moyenne
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          } as any;
        }

        // Fallback
        return {} as any;
      });

      const result = await RatingsApi.saveUserRating("creation-123", 4);

      expect(result).toBe(true);
    });

    it("should throw error when user tries to rate their own creation", async () => {
      // Mock pour que la création appartienne à l'utilisateur connecté
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "creations" && callCount === 1) {
          // Premier appel à "creations" - vérification artisan (même ID que l'utilisateur)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { artisan_id: "user-123" }, // Même ID que mockUser
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        // Les autres appels ne devraient pas être atteints car une erreur est lancée
        return {} as any;
      });

      await expect(
        RatingsApi.saveUserRating("creation-123", 5)
      ).rejects.toThrow("Vous ne pouvez pas noter vos propres créations");
    });

    it("should return false when user is not authenticated", async () => {
      (
        supabase.auth.getUser as MockedFunction<typeof supabase.auth.getUser>
      ).mockResolvedValue({
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

      mockSupabaseFrom(mockCreationsFrom);

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

      mockSupabaseFrom(mockCreationsFrom);
      mockSupabaseFrom(mockRatingsFrom);

      const result = await RatingsApi.saveUserRating("creation-123", 5);

      expect(result).toBe(false);
    });
  });

  describe("updateCreationAverageRating", () => {
    it("should update creation average rating successfully", async () => {
      // Mock pour gérer les appels multiples à supabase.from
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "creations" && callCount === 1) {
          // Premier appel à "creations" - vérification artisan
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { artisan_id: "other-user-123" },
                  error: null,
                }),
              }),
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 2) {
          // Deuxième appel à "user_ratings" - vérification notation existante
          return {
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
          } as any;
        } else if (table === "user_ratings" && callCount === 3) {
          // Troisième appel à "user_ratings" - insertion nouvelle notation
          return {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 4) {
          // Quatrième appel à "user_ratings" - calcul moyenne (pour updateCreationAverageRating)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: [{ rating: 5 }],
                error: null,
              }),
            }),
          } as any;
        } else if (table === "creations" && callCount === 5) {
          // Cinquième appel à "creations" - mise à jour note moyenne
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          } as any;
        }

        return {} as any;
      });

      // Appeler la méthode privée via une méthode publique qui l'utilise
      const result = await RatingsApi.saveUserRating("creation-123", 5);

      expect(result).toBe(true);
    });
  });

  describe("getCreationRatings", () => {
    it("should return creation ratings successfully", async () => {
      const mockRatings = [
        {
          id: "rating-1",
          rating: 5,
          user_id: "user-1",
          creation_id: "creation-123",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: null,
        },
        {
          id: "rating-2",
          rating: 4,
          user_id: "user-2",
          creation_id: "creation-123",
          created_at: "2024-01-02T00:00:00Z",
          updated_at: null,
        },
      ];

      // Utiliser mockImplementation avec un compteur d'appels
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "user_ratings" && callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockRatings,
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        // Fallback pour les autres appels
        return {} as any;
      });

      const result = await RatingsApi.getCreationRatings("creation-123");

      expect(result).toEqual([
        {
          id: "rating-1",
          userId: "user-1",
          creationId: "creation-123",
          rating: 5,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: null,
        },
        {
          id: "rating-2",
          userId: "user-2",
          creationId: "creation-123",
          rating: 4,
          createdAt: "2024-01-02T00:00:00Z",
          updatedAt: null,
        },
      ]);
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

      mockSupabaseFrom(mockFrom);

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

      mockSupabaseFrom(mockFrom);

      const result = await RatingsApi.getCreationRatings("creation-123");

      expect(result).toEqual([]);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete rating workflow", async () => {
      // Mock pour gérer tous les appels à supabase.from
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "creations" && callCount === 1) {
          // Premier appel à "creations" - vérification artisan
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { artisan_id: "other-user-123" },
                  error: null,
                }),
              }),
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 2) {
          // Deuxième appel à "user_ratings" - vérification notation existante
          return {
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
          } as any;
        } else if (table === "user_ratings" && callCount === 3) {
          // Troisième appel à "user_ratings" - insertion nouvelle notation
          return {
            insert: vi.fn().mockReturnValue({
              error: null,
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 4) {
          // Quatrième appel à "user_ratings" - calcul moyenne
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                data: [{ rating: 5 }],
                error: null,
              }),
            }),
          } as any;
        } else if (table === "creations" && callCount === 5) {
          // Cinquième appel à "creations" - mise à jour note moyenne
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                error: null,
              }),
            }),
          } as any;
        } else if (table === "user_ratings" && callCount === 6) {
          // Sixième appel à "user_ratings" - getUserRating
          return {
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
          } as any;
        } else if (table === "user_ratings" && callCount === 7) {
          // Septième appel à "user_ratings" - getCreationRatings
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [{ id: "rating-1", rating: 5, user_id: "user-1" }],
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        return {} as any;
      });

      // Créer une notation
      const saveResult = await RatingsApi.saveUserRating("creation-123", 5);
      expect(saveResult).toBe(true);

      // Récupérer la notation
      const rating = await RatingsApi.getUserRating("creation-123");
      expect(rating).toBe(5);

      // Récupérer toutes les notations
      const ratings = await RatingsApi.getCreationRatings("creation-123");
      expect(ratings).toHaveLength(1);
      expect(ratings[0].rating).toBe(5);
    });

    it("should handle multiple ratings for same creation", async () => {
      const mockRatings = [
        { id: "rating-1", rating: 5, user_id: "user-1" },
        { id: "rating-2", rating: 4, user_id: "user-2" },
        { id: "rating-3", rating: 3, user_id: "user-3" },
      ];

      // Utiliser mockImplementation avec un compteur d'appels
      let callCount = 0;
      (
        supabase.from as MockedFunction<typeof supabase.from>
      ).mockImplementation((table: string) => {
        callCount++;

        if (table === "user_ratings" && callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockRatings,
                  error: null,
                }),
              }),
            }),
          } as any;
        }

        // Fallback pour les autres appels
        return {} as any;
      });

      const ratings = await RatingsApi.getCreationRatings("creation-123");

      expect(ratings).toHaveLength(3);
      expect(ratings[0].rating).toBe(5);
      expect(ratings[1].rating).toBe(4);
      expect(ratings[2].rating).toBe(3);
    });
  });
});
