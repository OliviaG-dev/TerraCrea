import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreationsApi } from "../../services/creationsApi";
import { supabase } from "../../services/supabase";
import { CreationCategory, CreationWithArtisan } from "../../types/Creation";

// Mock de Supabase
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

// Mock des données de test
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockSupabaseCreation = {
  id: "creation-123",
  title: "Bracelet en argent",
  description: "Magnifique bracelet artisanal",
  price: 150,
  image_url: "https://example.com/image.jpg",
  category_id: CreationCategory.JEWELRY,
  artisan_id: "artisan-123",
  materials: ["argent", "pierre"],
  is_available: true,
  rating: 4.5,
  review_count: 10,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  tags: ["bijoux", "argent"],
  creation_tags: ["artisanal", "unique"],
  category_label: "Bijoux",
  artisan_name: "Artisan Test",
  artisan_location: "Paris",
  artisan_profile_image_url: "https://example.com/profile.jpg",
  artisan_bio: "Artisan passionné",
  artisan_email: "artisan@example.com",
  artisan_phone: "0123456789",
  artisan_is_verified: true,
  artisan_joined_at: "2023-01-01T00:00:00Z",
  artisan_updated_at: "2024-01-01T00:00:00Z",
  artisan_established_year: 2020,
  artisan_specialties: ["bijoux", "métal"],
  artisan_total_sales: 100,
};

const mockCreationWithArtisan: CreationWithArtisan = {
  id: "creation-123",
  title: "Bracelet en argent",
  description: "Magnifique bracelet artisanal",
  price: 150,
  imageUrl: "https://example.com/image.jpg",
  category: CreationCategory.JEWELRY,
  categoryLabel: "Bijoux",
  artisanId: "artisan-123",
  materials: ["argent", "pierre"],
  isAvailable: true,
  rating: 4.5,
  reviewCount: 10,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  tags: ["artisanal", "unique"], // Corrigé pour correspondre à creation_tags
  artisan: {
    id: "artisan-123",
    username: "artisan",
    firstName: "Artisan",
    lastName: "Test",
    profileImage: "https://example.com/profile.jpg",
    displayName: "Artisan Test",
    artisanProfile: {
      businessName: "Artisan Test",
      location: "Paris",
      verified: true,
      rating: 4.5,
      joinedAt: "2023-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      description: "Artisan passionné",
      establishedYear: 2020,
      specialties: ["bijoux", "métal"],
      totalSales: 100,
      email: "artisan@example.com",
      phone: "0123456789",
    },
  },
};

describe("CreationsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de l'authentification par défaut
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  describe("getAllCreations", () => {
    it("should return all creations successfully", async () => {
      // Mock de la chaîne Supabase complète
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getAllCreations();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
      expect(supabase.from).toHaveBeenCalledWith("creations_full");
    });

    it("should return empty array on error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getAllCreations();

      expect(result).toEqual([]);
    });
  });

  describe("searchCreations", () => {
    it("should search creations with query and category", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockOr = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockEq = vi.fn().mockReturnValue({
        or: mockOr,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.searchCreations(
        "bracelet",
        CreationCategory.JEWELRY
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
    });

    it("should search creations without category filter", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockOr = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        or: mockOr,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.searchCreations("bracelet", "all");

      expect(result).toHaveLength(1);
    });

    it("should return empty array on error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Search error"),
      });

      const mockOr = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        or: mockOr,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.searchCreations("bracelet", "all");

      expect(result).toEqual([]);
    });
  });

  describe("getCreationsByCategory", () => {
    it("should return creations by category successfully", async () => {
      // Mock de la chaîne Supabase : from().select().eq()
      const mockEq = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getCreationsByCategory(
        CreationCategory.JEWELRY
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
      expect(supabase.from).toHaveBeenCalledWith("creations_full");
    });
  });

  describe("getTopRatedCreations", () => {
    it("should return top rated creations successfully", async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockOrder2 = vi.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockOrder1 = vi.fn().mockReturnValue({
        order: mockOrder2,
      });

      const mockGte = vi.fn().mockReturnValue({
        order: mockOrder1,
      });

      const mockSelect = vi.fn().mockReturnValue({
        gte: mockGte,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getTopRatedCreations(5);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
    });
  });

  describe("getRecentCreations", () => {
    it("should return recent creations successfully", async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockOrder = vi.fn().mockReturnValue({
        limit: mockLimit,
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getRecentCreations(10);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
    });
  });

  describe("getCreationsByMaterial", () => {
    it("should return creations by material successfully", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockContains = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        contains: mockContains,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getCreationsByMaterial("argent");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
    });
  });

  describe("getCreationsByTag", () => {
    it("should return creations by tag successfully", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockContains = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        contains: mockContains,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.getCreationsByTag("bijoux");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCreationWithArtisan);
    });
  });

  describe("advancedTextSearch", () => {
    it("should use fulltext search when available", async () => {
      // Mock du RPC qui retourne des données
      (supabase.rpc as any).mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const result = await CreationsApi.advancedTextSearch("bracelet");

      expect(result).toHaveLength(1);
      expect(supabase.rpc).toHaveBeenCalledWith("search_creations_fulltext", {
        search_term: "bracelet",
      });
    });

    it("should fallback to simple search on error", async () => {
      // Mock du RPC qui retourne une erreur
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: new Error("RPC error"),
      });

      // Mock pour le fallback vers searchCreations
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockSupabaseCreation],
        error: null,
      });

      const mockOr = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        or: mockOr,
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const result = await CreationsApi.advancedTextSearch("bracelet");

      expect(result).toHaveLength(1);
      expect(supabase.rpc).toHaveBeenCalled();
    });
  });

  describe("isFavorite", () => {
    it("should return true when creation is favorite", async () => {
      // Mock pour la vérification de l'existence de la création
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "creation-123" },
        error: null,
      });

      const mockEq1 = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect1 = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      // Mock pour la vérification des favoris
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: "favorite-123" },
        error: null,
      });

      const mockEq3 = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockSelect2 = vi.fn().mockReturnValue({
        eq: mockEq2,
      });

      // Configuration des mocks pour les différents appels
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
        });

      const result = await CreationsApi.isFavorite("creation-123");

      expect(result).toBe(true);
    });

    it("should return false when creation is not favorite", async () => {
      // Mock pour la vérification de l'existence de la création
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "creation-123" },
        error: null,
      });

      const mockEq1 = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect1 = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      // Mock pour la vérification des favoris
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq3 = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockSelect2 = vi.fn().mockReturnValue({
        eq: mockEq2,
      });

      // Configuration des mocks pour les différents appels
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
        });

      const result = await CreationsApi.isFavorite("creation-123");

      expect(result).toBe(false);
    });
  });

  describe("addToFavorites", () => {
    it("should add creation to favorites successfully", async () => {
      // Mock pour la vérification de l'existence de la création
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "creation-123" },
        error: null,
      });

      const mockEq1 = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect1 = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      // Mock pour isFavorite (retourne false)
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq3 = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockSelect2 = vi.fn().mockReturnValue({
        eq: mockEq2,
      });

      // Mock pour l'insertion
      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      });

      // Configuration des mocks pour les différents appels
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
        })
        .mockReturnValueOnce({
          insert: mockInsert,
        });

      const result = await CreationsApi.addToFavorites("creation-123");

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("user_favorites");
    });

    it("should return false on error", async () => {
      // Mock pour la vérification de l'existence de la création
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "creation-123" },
        error: null,
      });

      const mockEq1 = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect1 = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      // Mock pour isFavorite (retourne false)
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq3 = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockSelect2 = vi.fn().mockReturnValue({
        eq: mockEq2,
      });

      // Mock pour l'insertion avec erreur
      const mockInsert = vi.fn().mockResolvedValue({
        error: new Error("Insert error"),
      });

      // Configuration des mocks pour les différents appels
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
        })
        .mockReturnValueOnce({
          insert: mockInsert,
        });

      const result = await CreationsApi.addToFavorites("creation-123");

      expect(result).toBe(false);
    });
  });

  describe("removeFromFavorites", () => {
    it("should remove creation from favorites successfully", async () => {
      // Mock pour la vérification de l'existence de la création
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "creation-123" },
        error: null,
      });

      const mockEq1 = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect1 = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      // Mock pour isFavorite (retourne true)
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: "favorite-123" },
        error: null,
      });

      const mockEq3 = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockSelect2 = vi.fn().mockReturnValue({
        eq: mockEq2,
      });

      // Mock pour la suppression
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      // Configuration des mocks pour les différents appels
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
        })
        .mockReturnValueOnce({
          delete: mockDelete,
        });

      const result = await CreationsApi.removeFromFavorites("creation-123");

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith("user_favorites");
    });

    it("should return false on error", async () => {
      // Mock pour la vérification de l'existence de la création
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "creation-123" },
        error: null,
      });

      const mockEq1 = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect1 = vi.fn().mockReturnValue({
        eq: mockEq1,
      });

      // Mock pour isFavorite (retourne true)
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: "favorite-123" },
        error: null,
      });

      const mockEq3 = vi.fn().mockReturnValue({
        maybeSingle: mockMaybeSingle,
      });

      const mockEq2 = vi.fn().mockReturnValue({
        eq: mockEq3,
      });

      const mockSelect2 = vi.fn().mockReturnValue({
        eq: mockEq2,
      });

      // Mock pour la suppression avec erreur
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: new Error("Delete error"),
          }),
        }),
      });

      // Configuration des mocks pour les différents appels
      (supabase.from as any)
        .mockReturnValueOnce({
          select: mockSelect1,
        })
        .mockReturnValueOnce({
          select: mockSelect2,
        })
        .mockReturnValueOnce({
          delete: mockDelete,
        });

      const result = await CreationsApi.removeFromFavorites("creation-123");

      expect(result).toBe(false);
    });
  });
});
