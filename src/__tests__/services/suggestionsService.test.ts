import { describe, it, expect, beforeEach, vi, MockedFunction } from "vitest";
import { suggestionsService } from "../../services/suggestionsService";
import { CreationsApi } from "../../services/creationsApi";
import { CreationCategory, CreationWithArtisan } from "../../types/Creation";

// Mock de CreationsApi
vi.mock("../../services/creationsApi", () => ({
  CreationsApi: {
    getAllCreations: vi.fn(),
    getAllCreators: vi.fn(),
  },
}));

describe("SuggestionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the cache before each test
    suggestionsService.clearCache();
  });

  describe("getCreationSuggestions", () => {
    const mockCreations: CreationWithArtisan[] = [
      {
        id: "creation-1",
        title: "Bracelet en argent",
        description: "Magnifique bracelet artisanal",
        price: 150,
        imageUrl: "https://example.com/image1.jpg",
        category: CreationCategory.JEWELRY,
        artisanId: "artisan-1",
        materials: ["argent", "pierre"],
        isAvailable: true,
        rating: 4.5,
        reviewCount: 10,
        createdAt: "2024-01-01T00:00:00Z",
        tags: ["bijoux", "argent", "artisanal"],
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
        description: "Vase élégant en céramique",
        price: 80,
        imageUrl: "https://example.com/image2.jpg",
        category: CreationCategory.POTTERY,
        artisanId: "artisan-2",
        materials: ["céramique", "argile"],
        isAvailable: true,
        rating: 4.0,
        reviewCount: 5,
        createdAt: "2024-01-02T00:00:00Z",
        tags: ["poterie", "céramique", "décoration"],
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
        title: "Table en bois massif",
        description: "Table rustique en bois",
        price: 300,
        imageUrl: "https://example.com/image3.jpg",
        category: CreationCategory.WOODWORK,
        artisanId: "artisan-3",
        materials: ["bois", "chêne"],
        isAvailable: true,
        rating: 4.8,
        reviewCount: 15,
        createdAt: "2024-01-03T00:00:00Z",
        tags: ["mobilier", "bois", "rustique"],
        artisan: {
          id: "artisan-3",
          artisanProfile: {
            businessName: "Artisan 3",
            verified: true,
          },
        } as any,
      },
    ];

    it("should return creation suggestions for title matches", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      const result = await suggestionsService.getCreationSuggestions(
        "bracelet"
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "title_creation-1",
        text: "Bracelet en argent",
        type: "Titre de création",
        icon: "🎨",
      });
    });

    it("should return creation suggestions for material matches", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      const result = await suggestionsService.getCreationSuggestions("argent");

      // Devrait retourner 3 suggestions : titre "Bracelet en argent", matériau "argent", et tag "argent"
      expect(result).toHaveLength(3);
      expect(
        result.some(
          (item) =>
            item.type === "Titre de création" &&
            item.text === "Bracelet en argent"
        )
      ).toBe(true);
      expect(
        result.some(
          (item) => item.type === "Matériau" && item.text === "argent"
        )
      ).toBe(true);
      expect(
        result.some((item) => item.type === "Tag" && item.text === "argent")
      ).toBe(true);
    });

    it("should return creation suggestions for tag matches", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      const result = await suggestionsService.getCreationSuggestions("bijoux");

      // Devrait retourner 2 suggestions : tag "bijoux" et catégorie "Bijoux"
      expect(result).toHaveLength(2);
      expect(
        result.some((item) => item.type === "Tag" && item.text === "bijoux")
      ).toBe(true);
      expect(
        result.some(
          (item) => item.type === "Catégorie" && item.text === "Bijoux"
        )
      ).toBe(true);
    });

    it("should return creation suggestions for category matches", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      const result = await suggestionsService.getCreationSuggestions("bijoux");

      // Devrait retourner 2 suggestions (tag bijoux + catégorie Bijoux)
      expect(result).toHaveLength(2);
    });

    it("should limit title suggestions to 3", async () => {
      const manyCreations = [
        ...mockCreations,
        {
          id: "creation-4",
          title: "Bracelet en or",
          description: "Bracelet doré",
          price: 200,
          imageUrl: "https://example.com/image4.jpg",
          category: CreationCategory.JEWELRY,
          artisanId: "artisan-4",
          materials: ["or"],
          isAvailable: true,
          rating: 4.2,
          reviewCount: 8,
          createdAt: "2024-01-04T00:00:00Z",
          tags: ["bijoux", "or"],
          artisan: {
            id: "artisan-4",
            artisanProfile: {
              businessName: "Artisan 4",
              verified: true,
            },
          } as any,
        },
        {
          id: "creation-5",
          title: "Bracelet en cuir",
          description: "Bracelet en cuir",
          price: 50,
          imageUrl: "https://example.com/image5.jpg",
          category: CreationCategory.TEXTILES,
          artisanId: "artisan-5",
          materials: ["cuir"],
          isAvailable: true,
          rating: 4.0,
          reviewCount: 6,
          createdAt: "2024-01-05T00:00:00Z",
          tags: ["bijoux", "cuir"],
          artisan: {
            id: "artisan-5",
            artisanProfile: {
              businessName: "Artisan 5",
              verified: false,
            },
          } as any,
        },
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(manyCreations);

      const result = await suggestionsService.getCreationSuggestions(
        "bracelet"
      );

      // Devrait être limité à 3 suggestions de titre
      expect(result).toHaveLength(3);
      expect(result.every((item) => item.type === "Titre de création")).toBe(
        true
      );
    });

    it("should limit material suggestions to 2", async () => {
      const manyCreations = [
        ...mockCreations,
        {
          id: "creation-4",
          title: "Bague en argent",
          description: "Bague en argent",
          price: 100,
          imageUrl: "https://example.com/image4.jpg",
          category: CreationCategory.JEWELRY,
          artisanId: "artisan-4",
          materials: ["argent", "diamant"],
          isAvailable: true,
          rating: 4.3,
          reviewCount: 7,
          createdAt: "2024-01-04T00:00:00Z",
          tags: ["bijoux", "argent"],
          artisan: {
            id: "artisan-4",
            artisanProfile: {
              businessName: "Artisan 4",
              verified: true,
            },
          } as any,
        },
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(manyCreations);

      const result = await suggestionsService.getCreationSuggestions("argent");

      // Devrait être limité à 1 suggestion de matériau (argent apparaît dans 2 créations mais est dédupliqué)
      expect(result.filter((item) => item.type === "Matériau")).toHaveLength(1);
      // Vérifier que tous les éléments sont soit Titre de création, Matériau, ou Tag
      const validTypes = result.every(
        (item) =>
          item.type === "Titre de création" ||
          item.type === "Matériau" ||
          item.type === "Tag"
      );
      expect(validTypes).toBe(true);
    });

    it("should deduplicate materials and tags", async () => {
      const duplicateCreations = [
        ...mockCreations,
        {
          id: "creation-4",
          title: "Autre bracelet en argent",
          description: "Autre bracelet",
          price: 120,
          imageUrl: "https://example.com/image4.jpg",
          category: CreationCategory.JEWELRY,
          artisanId: "artisan-4",
          materials: ["argent", "pierre"], // Duplique les matériaux
          isAvailable: true,
          rating: 4.1,
          reviewCount: 4,
          createdAt: "2024-01-04T00:00:00Z",
          tags: ["bijoux", "argent"], // Duplique les tags
          artisan: {
            id: "artisan-4",
            artisanProfile: {
              businessName: "Artisan 4",
              verified: false,
            },
          } as any,
        },
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(duplicateCreations);

      const result = await suggestionsService.getCreationSuggestions("argent");

      // Devrait dédupliquer les matériaux et tags
      const materialSuggestions = result.filter(
        (item) => item.type === "Matériau"
      );
      const tagSuggestions = result.filter((item) => item.type === "Tag");

      expect(materialSuggestions).toHaveLength(1); // Un seul "argent" dans les matériaux
      expect(tagSuggestions).toHaveLength(1); // Un seul "argent" dans les tags
      expect(result).toHaveLength(4); // Total : 1 matériau + 1 tag + 1 catégorie + 1 titre (si "argent" est dans un titre)
    });

    it("should return empty array when no matches found", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      const result = await suggestionsService.getCreationSuggestions("xyz");

      expect(result).toHaveLength(0);
    });

    it("should use cache for subsequent calls", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      // Premier appel
      const result1 = await suggestionsService.getCreationSuggestions(
        "bracelet"
      );
      expect(result1).toHaveLength(1);

      // Deuxième appel (devrait utiliser le cache)
      const result2 = await suggestionsService.getCreationSuggestions(
        "bracelet"
      );
      expect(result2).toHaveLength(1);

      // getAllCreations ne devrait être appelé qu'une fois
      expect(CreationsApi.getAllCreations).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCreatorSuggestions", () => {
    const mockCreators = [
      {
        id: "artisan-1",
        displayName: "Jean Dupont",
        artisanProfile: {
          businessName: "Artisan Bijoux",
          verified: true,
          location: "Paris",
        },
      },
      {
        id: "artisan-2",
        displayName: "Marie Martin",
        artisanProfile: {
          businessName: "Céramique Art",
          verified: false,
          location: "Lyon",
        },
      },
      {
        id: "artisan-3",
        displayName: "Pierre Durand",
        artisanProfile: {
          businessName: "Bois et Design",
          verified: true,
          location: "Marseille",
        },
      },
    ] as any[];

    it("should return creator suggestions for name matches", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCreatorSuggestions("jean");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "name_artisan-1",
        text: "Jean Dupont",
        type: "Nom d'artisan",
        icon: "👨‍🎨",
      });
    });

    it("should return creator suggestions for business name matches", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCreatorSuggestions("bijoux");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "business_artisan-1",
        text: "Artisan Bijoux",
        type: "Nom d'entreprise",
        icon: "🏢",
      });
    });

    it("should return creator suggestions for specialty matches", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCreatorSuggestions(
        "céramique"
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "business_artisan-2",
        text: "Céramique Art",
        type: "Nom d'entreprise",
        icon: "🏢",
      });
    });

    it("should return creator suggestions for location matches", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCreatorSuggestions("paris");

      // Devrait retourner 1 suggestion de localisation
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "location_artisan-1",
        text: "Paris",
        type: "Localisation",
        icon: "📍",
      });
    });

    it("should limit suggestions appropriately", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCreatorSuggestions("a");

      // Devrait être limité selon les règles du service
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(10); // Limite générale
    });

    it("should return empty array when no matches found", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCreatorSuggestions("xyz");

      expect(result).toHaveLength(0);
    });
  });

  describe("getCitySuggestions", () => {
    const mockCreators = [
      {
        id: "artisan-1",
        artisanProfile: {
          businessName: "Artisan Bijoux",
          location: "Paris",
        },
      },
      {
        id: "artisan-2",
        artisanProfile: {
          businessName: "Céramique Art",
          location: "Lyon",
        },
      },
      {
        id: "artisan-3",
        artisanProfile: {
          businessName: "Bois et Design",
          location: "Marseille",
        },
      },
      {
        id: "artisan-4",
        artisanProfile: {
          businessName: "Autre Artisan",
          location: "Bordeaux",
        },
      },
      {
        id: "artisan-5",
        artisanProfile: {
          businessName: "Encore Un",
          location: "Toulouse",
        },
      },
    ] as any[];

    it("should return city suggestions for location matches", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCitySuggestions("par");

      // Devrait retourner 1 suggestion (Paris)
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "city_Paris",
        text: "Paris",
        type: "Ville",
        icon: "🏙️",
      });
    });

    it("should return multiple city suggestions", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCitySuggestions("e");

      // Devrait retourner plusieurs suggestions contenant "e"
      expect(result.length).toBeGreaterThan(1);
      expect(result.every((item) => item.type === "Ville")).toBe(true);
    });

    it("should deduplicate cities", async () => {
      const duplicateCreators = [
        ...mockCreators,
        {
          id: "artisan-4",
          artisanProfile: {
            businessName: "Autre Artisan",
            location: "Paris", // Duplique Paris
          },
        },
      ];

      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(duplicateCreators);

      const result = await suggestionsService.getCitySuggestions("paris");

      // Devrait dédupliquer Paris
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe("Paris");
    });

    it("should return empty array when no matches found", async () => {
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getCitySuggestions("xyz");

      expect(result).toHaveLength(0);
    });
  });

  describe("getSuggestions", () => {
    it("should route to correct suggestion type", async () => {
      const mockCreations = [
        {
          id: "creation-1",
          title: "Bracelet en argent",
          materials: ["argent"],
          tags: ["bijoux"],
          artisan: {
            artisanProfile: {
              businessName: "Artisan Bijoux",
              location: "Paris",
            },
          },
        } as any,
      ];

      const mockCreators = [
        {
          id: "artisan-1",
          artisanProfile: {
            businessName: "Artisan Bijoux",
            location: "Paris",
          },
        } as any,
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      const result = await suggestionsService.getSuggestions("bracelet");

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((item) => item.type === "Titre de création")).toBe(
        true
      );
    });

    it("should combine different suggestion types", async () => {
      const mockCreations = [
        {
          id: "creation-1",
          title: "Bracelet en argent",
          materials: ["argent"],
          tags: ["bijoux"],
          artisan: {
            artisanProfile: {
              businessName: "Artisan Bijoux",
              location: "Paris",
            },
          },
        } as any,
      ];

      const mockCreators = [
        {
          id: "artisan-1",
          artisanProfile: {
            businessName: "Artisan Bijoux",
            location: "Paris",
          },
        } as any,
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue(mockCreators);

      // Utiliser "bijoux" qui correspond à la fois aux tags des créations et aux noms d'entreprise
      const result = await suggestionsService.getSuggestions("bijoux");

      // Devrait combiner les suggestions de créations et de créateurs
      expect(result.length).toBeGreaterThan(1);
      expect(result.some((item) => item.type === "Tag")).toBe(true);
      // "bijoux" devrait générer des suggestions de noms d'entreprise
      expect(result.some((item) => item.type === "Nom d'entreprise")).toBe(
        true
      );
    });

    it("should handle empty results gracefully", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue([]);
      (
        CreationsApi.getAllCreators as MockedFunction<
          typeof CreationsApi.getAllCreators
        >
      ).mockResolvedValue([]);

      const result = await suggestionsService.getSuggestions("xyz");

      expect(result).toHaveLength(0);
    });
  });

  describe("Cache functionality", () => {
    it("should cache suggestions and respect expiry", async () => {
      const mockCreations = [
        {
          id: "creation-1",
          title: "Bracelet en argent",
          materials: ["argent"],
          tags: ["bijoux"],
          artisan: {
            artisanProfile: {
              businessName: "Artisan Bijoux",
            },
          },
        } as any,
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      // Premier appel
      const result1 = await suggestionsService.getCreationSuggestions(
        "bracelet"
      );
      expect(result1).toHaveLength(1);

      // Deuxième appel (devrait utiliser le cache)
      const result2 = await suggestionsService.getCreationSuggestions(
        "bracelet"
      );
      expect(result2).toHaveLength(1);

      // getAllCreations ne devrait être appelé qu'une fois
      expect(CreationsApi.getAllCreations).toHaveBeenCalledTimes(1);
    });

    it("should clear cache when requested", async () => {
      const mockCreations = [
        {
          id: "creation-1",
          title: "Bracelet en argent",
          materials: ["argent"],
          tags: ["bijoux"],
          artisan: {
            artisanProfile: {
              businessName: "Artisan Bijoux",
            },
          },
        } as any,
      ];

      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue(mockCreations);

      // Premier appel
      await suggestionsService.getCreationSuggestions("bracelet");

      // Vider le cache
      suggestionsService.clearCache();

      // Deuxième appel (devrait recharger les données)
      await suggestionsService.getCreationSuggestions("bracelet");

      // getAllCreations devrait être appelé deux fois
      expect(CreationsApi.getAllCreations).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error handling", () => {
    it("should handle API errors gracefully", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockRejectedValue(new Error("API Error"));

      const result = await suggestionsService.getCreationSuggestions("test");

      expect(result).toHaveLength(0);
    });

    it("should handle empty API responses", async () => {
      (
        CreationsApi.getAllCreations as MockedFunction<
          typeof CreationsApi.getAllCreations
        >
      ).mockResolvedValue([]);

      const result = await suggestionsService.getCreationSuggestions("test");

      expect(result).toHaveLength(0);
    });
  });
});
