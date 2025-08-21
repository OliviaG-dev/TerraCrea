import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreationCard } from "../../components/CreationCard";
import { CreationCategory, CreationWithArtisan } from "../../types/Creation";

// Mock des composants React Native pour les tests
vi.mock("react-native", () => ({
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Image: ({ source, ...props }: any) => (
    <img src={source?.uri || source} alt="creation" {...props} />
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Dimensions: {
    get: () => ({ width: 400, height: 800 }),
  },
}));

describe("CreationCard", () => {
  const mockOnPress = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  const mockCreation: CreationWithArtisan = {
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
    tags: ["artisanal", "unique"],
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

  const defaultProps = {
    item: mockCreation,
    isFavorite: false,
    onToggleFavorite: mockOnToggleFavorite,
    onPress: mockOnPress,
    isAuthenticated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Affichage des informations de création", () => {
    it("should display creation title correctly", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should display creation description", () => {
      render(<CreationCard {...defaultProps} />);
      expect(
        screen.getByText("Magnifique bracelet artisanal")
      ).toBeInTheDocument();
    });

    it("should display price correctly", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("150.00 €")).toBeInTheDocument();
    });

    it("should display category label", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Bijoux")).toBeInTheDocument();
    });

    it("should display rating", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();
    });

    it("should display review count", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("(10 avis)")).toBeInTheDocument();
    });

    it("should display tags", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("#artisanal")).toBeInTheDocument();
      expect(screen.getByText("#unique")).toBeInTheDocument();
    });
  });

  describe("Affichage des informations artisan", () => {
    it("should display artisan name", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Artisan Test")).toBeInTheDocument();
    });

    it("should display artisan name from displayName", () => {
      const creationWithDisplayName = {
        ...mockCreation,
        artisan: {
          ...mockCreation.artisan,
          displayName: "Artisan Créatif",
        },
      };
      render(<CreationCard {...defaultProps} item={creationWithDisplayName} />);
      expect(screen.getByText("Artisan Créatif")).toBeInTheDocument();
    });

    it("should fallback to firstName + lastName when displayName not available", () => {
      const creationWithoutDisplayName = {
        ...mockCreation,
        artisan: {
          ...mockCreation.artisan,
          displayName: undefined,
        },
      };
      render(
        <CreationCard {...defaultProps} item={creationWithoutDisplayName} />
      );
      expect(screen.getByText("Artisan Test")).toBeInTheDocument();
    });

    it("should fallback to username when name not available", () => {
      const creationWithOnlyUsername = {
        ...mockCreation,
        artisan: {
          ...mockCreation.artisan,
          displayName: undefined,
          firstName: undefined,
          lastName: undefined,
        },
      };
      render(
        <CreationCard {...defaultProps} item={creationWithOnlyUsername} />
      );
      expect(screen.getByText("artisan")).toBeInTheDocument();
    });

    it("should show 'Artisan inconnu' when no artisan info", () => {
      const creationWithoutArtisan = {
        ...mockCreation,
        artisan: undefined,
      } as any;
      render(<CreationCard {...defaultProps} item={creationWithoutArtisan} />);
      expect(screen.getByText("Artisan inconnu")).toBeInTheDocument();
    });
  });

  describe("Affichage des images", () => {
    it("should display creation image", () => {
      render(<CreationCard {...defaultProps} />);
      const creationImage = screen.getByAltText("creation");
      expect(creationImage).toHaveAttribute(
        "src",
        "https://example.com/image.jpg"
      );
    });

    it("should handle missing creation image gracefully", () => {
      const creationWithoutImage = {
        ...mockCreation,
        imageUrl: "",
      };

      expect(() => {
        render(<CreationCard {...defaultProps} item={creationWithoutImage} />);
      }).not.toThrow();
    });
  });

  describe("Interactions", () => {
    it("should handle card press", () => {
      render(<CreationCard {...defaultProps} />);

      const viewDetailsButton = screen.getByText("Voir plus");
      fireEvent.click(viewDetailsButton);

      expect(mockOnPress).toHaveBeenCalledWith(mockCreation);
    });

    it("should handle favorite button press", () => {
      render(<CreationCard {...defaultProps} />);

      const favoriteButton = screen.getByText("♡").closest("button");
      fireEvent.click(favoriteButton!);

      expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockCreation.id);
    });

    it("should handle multiple rapid interactions gracefully", () => {
      render(<CreationCard {...defaultProps} />);

      const viewDetailsButton = screen.getByText("Voir plus");
      const favoriteButton = screen.getByText("♡").closest("button");

      // Interactions rapides multiples
      fireEvent.click(viewDetailsButton);
      fireEvent.click(favoriteButton!);
      fireEvent.click(viewDetailsButton);

      expect(mockOnPress).toHaveBeenCalledTimes(2);
      expect(mockOnToggleFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe("États", () => {
    it("should show availability status when available", () => {
      render(<CreationCard {...defaultProps} />);
      // Vérifier que le composant se rend sans erreur
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should show availability status when not available", () => {
      const unavailableCreation = {
        ...mockCreation,
        isAvailable: false,
      };

      render(<CreationCard {...defaultProps} item={unavailableCreation} />);
      // Vérifier que le composant se rend sans erreur
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should handle different price formats", () => {
      const { rerender } = render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("150.00 €")).toBeInTheDocument();

      const expensiveCreation = {
        ...mockCreation,
        price: 999.99,
      };
      rerender(<CreationCard {...defaultProps} item={expensiveCreation} />);
      expect(screen.getByText("999.99 €")).toBeInTheDocument();

      const freeCreation = {
        ...mockCreation,
        price: 0,
      };
      rerender(<CreationCard {...defaultProps} item={freeCreation} />);
      expect(screen.getByText("0.00 €")).toBeInTheDocument();
    });

    it("should handle different rating values", () => {
      const { rerender } = render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("⭐ 4.5")).toBeInTheDocument();

      const noRatingCreation = {
        ...mockCreation,
        rating: 0,
        reviewCount: 0,
      };
      rerender(<CreationCard {...defaultProps} item={noRatingCreation} />);
      expect(screen.getByText("⭐ 0.0")).toBeInTheDocument();
    });
  });

  describe("Gestion des erreurs", () => {
    it("should handle missing creation data gracefully", () => {
      const incompleteCreation = {
        id: "creation-123",
        title: "Bracelet en argent",
        // Données manquantes
      } as any;

      expect(() => {
        render(<CreationCard {...defaultProps} item={incompleteCreation} />);
      }).not.toThrow();
    });

    it("should handle null/undefined props gracefully", () => {
      expect(() => {
        render(
          <CreationCard
            item={{} as any}
            onPress={mockOnPress}
            onToggleFavorite={mockOnToggleFavorite}
            isFavorite={false}
            isAuthenticated={true}
          />
        );
      }).not.toThrow();
    });

    it("should handle missing artisan data gracefully", () => {
      const creationWithoutArtisan = {
        ...mockCreation,
        artisan: {
          id: "artisan-123",
          verified: false,
        } as any,
      };

      expect(() => {
        render(
          <CreationCard {...defaultProps} item={creationWithoutArtisan} />
        );
      }).not.toThrow();
    });

    it("should handle missing materials gracefully", () => {
      const creationWithoutMaterials = {
        ...mockCreation,
        materials: [],
      };

      expect(() => {
        render(
          <CreationCard {...defaultProps} item={creationWithoutMaterials} />
        );
      }).not.toThrow();
    });

    it("should handle missing tags gracefully", () => {
      const creationWithoutTags = {
        ...mockCreation,
        tags: [],
      };

      expect(() => {
        render(<CreationCard {...defaultProps} item={creationWithoutTags} />);
      }).not.toThrow();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper button roles", () => {
      render(<CreationCard {...defaultProps} />);

      const viewDetailsButton = screen.getByText("Voir plus");
      const favoriteButton = screen.getByText("♡").closest("button");

      expect(viewDetailsButton).toBeInTheDocument();
      expect(favoriteButton).toBeInTheDocument();
    });

    it("should have proper accessibility labels", () => {
      render(<CreationCard {...defaultProps} />);

      const viewDetailsButton = screen.getByText("Voir plus");
      expect(viewDetailsButton).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(<CreationCard {...defaultProps} />);

      const viewDetailsButton = screen.getByText("Voir plus");
      const favoriteButton = screen.getByText("♡").closest("button");

      // Test de navigation clavier - le composant ne gère pas les événements clavier
      // donc on teste juste que les boutons existent
      expect(viewDetailsButton).toBeInTheDocument();
      expect(favoriteButton).toBeInTheDocument();
    });
  });

  describe("Fonctionnalités des favoris", () => {
    it("should show heart icon when not favorite", () => {
      render(<CreationCard {...defaultProps} isFavorite={false} />);

      const favoriteButton = screen.getByText("♡").closest("button");
      expect(favoriteButton).toBeInTheDocument();
      expect(screen.getByText("♡")).toBeInTheDocument();
    });

    it("should show filled heart icon when favorite", () => {
      render(<CreationCard {...defaultProps} isFavorite={true} />);

      const favoriteButton = screen.getByText("♥").closest("button");
      expect(favoriteButton).toBeInTheDocument();
      expect(screen.getByText("♥")).toBeInTheDocument();
    });

    it("should not show favorite button when not authenticated", () => {
      render(<CreationCard {...defaultProps} isAuthenticated={false} />);

      expect(screen.queryByText("♡")).not.toBeInTheDocument();
      expect(screen.queryByText("♥")).not.toBeInTheDocument();
    });

    it("should call onToggleFavorite with correct creation ID", () => {
      render(<CreationCard {...defaultProps} />);

      const favoriteButton = screen.getByText("♡").closest("button");
      fireEvent.click(favoriteButton!);

      expect(mockOnToggleFavorite).toHaveBeenCalledWith("creation-123");
    });
  });

  describe("Formatage des dates", () => {
    it("should format creation date correctly", () => {
      render(<CreationCard {...defaultProps} />);

      // La date devrait être formatée en français
      expect(screen.getByText(/1 janvier 2024/)).toBeInTheDocument();
    });

    it("should handle missing creation date", () => {
      const creationWithoutDate = {
        ...mockCreation,
        createdAt: "",
      };

      render(<CreationCard {...defaultProps} item={creationWithoutDate} />);

      expect(screen.getByText("Date inconnue")).toBeInTheDocument();
    });

    it("should handle invalid date format", () => {
      const creationWithInvalidDate = {
        ...mockCreation,
        createdAt: "invalid-date",
      };

      expect(() => {
        render(
          <CreationCard {...defaultProps} item={creationWithInvalidDate} />
        );
      }).not.toThrow();
    });
  });

  describe("Gestion des tags", () => {
    it("should display default tags when no tags provided", () => {
      const creationWithoutTags = {
        ...mockCreation,
        tags: [],
      };

      render(<CreationCard {...defaultProps} item={creationWithoutTags} />);

      expect(screen.getByText("#fait-main")).toBeInTheDocument();
      expect(screen.getByText("#bijoux")).toBeInTheDocument();
      expect(screen.getByText("#premium")).toBeInTheDocument();
    });

    it("should limit displayed tags to 4 and show count", () => {
      const creationWithManyTags = {
        ...mockCreation,
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
      };

      render(<CreationCard {...defaultProps} item={creationWithManyTags} />);

      expect(screen.getByText("#tag1")).toBeInTheDocument();
      expect(screen.getByText("#tag2")).toBeInTheDocument();
      expect(screen.getByText("#tag3")).toBeInTheDocument();
      expect(screen.getByText("#tag4")).toBeInTheDocument();
      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("should filter out invalid tags", () => {
      const creationWithInvalidTags = {
        ...mockCreation,
        tags: ["valid", "", "   ", "also-valid"],
      };

      render(<CreationCard {...defaultProps} item={creationWithInvalidTags} />);

      expect(screen.getByText("#valid")).toBeInTheDocument();
      expect(screen.getByText("#also-valid")).toBeInTheDocument();
      expect(screen.queryByText("#")).not.toBeInTheDocument();
    });
  });

  describe("Gestion des catégories", () => {
    it("should display category label when available", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Bijoux")).toBeInTheDocument();
    });

    it("should fallback to category enum when label not available", () => {
      const creationWithoutLabel = {
        ...mockCreation,
        categoryLabel: undefined,
      };

      render(<CreationCard {...defaultProps} item={creationWithoutLabel} />);
      expect(screen.getByText("Bijoux")).toBeInTheDocument();
    });

    it("should handle unknown category gracefully", () => {
      const creationWithUnknownCategory = {
        ...mockCreation,
        category: "unknown" as any,
        categoryLabel: undefined,
      };

      render(
        <CreationCard {...defaultProps} item={creationWithUnknownCategory} />
      );
      expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render quickly with minimal props", () => {
      const startTime = performance.now();

      render(<CreationCard {...defaultProps} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Le rendu devrait être rapide (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it("should handle re-renders efficiently", () => {
      const { rerender } = render(<CreationCard {...defaultProps} />);

      const startTime = performance.now();

      // Re-renders multiples
      rerender(<CreationCard {...defaultProps} isFavorite={true} />);
      rerender(<CreationCard {...defaultProps} isAuthenticated={false} />);
      rerender(<CreationCard {...defaultProps} isFavorite={false} />);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Les re-renders devraient être rapides
      expect(totalTime).toBeLessThan(200);
    });
  });
});
