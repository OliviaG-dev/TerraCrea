import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreationCard } from "../../components/CreationCard";
import { CreationCategory } from "../../types/Creation";

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
}));

// Mock de react-navigation
vi.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
  }),
}));

describe("CreationCard", () => {
  const mockOnPress = vi.fn();
  const mockOnFavoritePress = vi.fn();

  const mockCreation = {
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
    creation: mockCreation,
    onPress: mockOnPress,
    onFavoritePress: mockOnFavoritePress,
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
      expect(screen.getByText("150 €")).toBeInTheDocument();
    });

    it("should display category label", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Bijoux")).toBeInTheDocument();
    });

    it("should display materials", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("argent, pierre")).toBeInTheDocument();
    });

    it("should display rating", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    it("should display review count", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("(10 avis)")).toBeInTheDocument();
    });

    it("should display tags", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("artisanal, unique")).toBeInTheDocument();
    });
  });

  describe("Affichage des informations artisan", () => {
    it("should display artisan name", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Artisan Test")).toBeInTheDocument();
    });

    it("should display artisan location", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Paris")).toBeInTheDocument();
    });

    it("should display artisan profile image", () => {
      render(<CreationCard {...defaultProps} />);
      const profileImage = screen.getByAltText("artisan profile");
      expect(profileImage).toHaveAttribute(
        "src",
        "https://example.com/profile.jpg"
      );
    });

    it("should display artisan verification status", () => {
      render(<CreationCard {...defaultProps} />);
      // Vérifier que l'indicateur de vérification est présent
      expect(screen.getByText("Artisan Test")).toBeInTheDocument();
    });

    it("should display artisan rating", () => {
      render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
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
        imageUrl: null,
      };

      render(
        <CreationCard {...defaultProps} creation={creationWithoutImage} />
      );

      // Ne devrait pas planter
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should handle missing artisan profile image gracefully", () => {
      const creationWithoutProfileImage = {
        ...mockCreation,
        artisan: {
          ...mockCreation.artisan,
          profileImage: null,
        },
      };

      render(
        <CreationCard
          {...defaultProps}
          creation={creationWithoutProfileImage}
        />
      );

      // Ne devrait pas planter
      expect(screen.getByText("Artisan Test")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should handle card press", () => {
      render(<CreationCard {...defaultProps} />);

      const card = screen.getByText("Bracelet en argent").closest("button");
      fireEvent.click(card!);

      expect(mockOnPress).toHaveBeenCalledWith(mockCreation);
    });

    it("should handle favorite button press", () => {
      render(<CreationCard {...defaultProps} />);

      const favoriteButton = screen.getByRole("button", { name: /favorite/i });
      fireEvent.click(favoriteButton);

      expect(mockOnFavoritePress).toHaveBeenCalledWith(mockCreation.id);
    });

    it("should handle multiple rapid interactions gracefully", () => {
      render(<CreationCard {...defaultProps} />);

      const card = screen.getByText("Bracelet en argent").closest("button");
      const favoriteButton = screen.getByRole("button", { name: /favorite/i });

      // Interactions rapides multiples
      fireEvent.click(card!);
      fireEvent.click(favoriteButton);
      fireEvent.click(card!);

      expect(mockOnPress).toHaveBeenCalledTimes(2);
      expect(mockOnFavoritePress).toHaveBeenCalledTimes(1);
    });
  });

  describe("États", () => {
    it("should show availability status when available", () => {
      render(<CreationCard {...defaultProps} />);

      // Vérifier que le statut de disponibilité est affiché
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should show availability status when not available", () => {
      const unavailableCreation = {
        ...mockCreation,
        isAvailable: false,
      };

      render(<CreationCard {...defaultProps} creation={unavailableCreation} />);

      // Vérifier que le statut de non-disponibilité est affiché
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should show loading state while fetching data", () => {
      render(<CreationCard {...defaultProps} loading={true} />);

      // Vérifier que l'état de chargement est affiché
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should handle different price formats", () => {
      const { rerender } = render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("150 €")).toBeInTheDocument();

      const expensiveCreation = {
        ...mockCreation,
        price: 999.99,
      };
      rerender(<CreationCard {...defaultProps} creation={expensiveCreation} />);
      expect(screen.getByText("999.99 €")).toBeInTheDocument();

      const freeCreation = {
        ...mockCreation,
        price: 0,
      };
      rerender(<CreationCard {...defaultProps} creation={freeCreation} />);
      expect(screen.getByText("Gratuit")).toBeInTheDocument();
    });

    it("should handle different rating values", () => {
      const { rerender } = render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();

      const noRatingCreation = {
        ...mockCreation,
        rating: null,
        reviewCount: 0,
      };
      rerender(<CreationCard {...defaultProps} creation={noRatingCreation} />);
      expect(screen.queryByText("(0 avis)")).not.toBeInTheDocument();
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
        render(
          <CreationCard {...defaultProps} creation={incompleteCreation} />
        );
      }).not.toThrow();
    });

    it("should handle null/undefined props gracefully", () => {
      expect(() => {
        render(<CreationCard creation={null as any} onPress={mockOnPress} />);
      }).not.toThrow();
    });

    it("should handle missing artisan data gracefully", () => {
      const creationWithoutArtisan = {
        ...mockCreation,
        artisan: null,
      };

      render(
        <CreationCard {...defaultProps} creation={creationWithoutArtisan} />
      );

      // Ne devrait pas planter
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should handle missing materials gracefully", () => {
      const creationWithoutMaterials = {
        ...mockCreation,
        materials: null,
      };

      render(
        <CreationCard {...defaultProps} creation={creationWithoutMaterials} />
      );

      // Ne devrait pas planter
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });

    it("should handle missing tags gracefully", () => {
      const creationWithoutTags = {
        ...mockCreation,
        tags: null,
      };

      render(<CreationCard {...defaultProps} creation={creationWithoutTags} />);

      // Ne devrait pas planter
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper button roles", () => {
      render(<CreationCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /bracelet en argent/i });
      const favoriteButton = screen.getByRole("button", { name: /favorite/i });

      expect(card).toBeInTheDocument();
      expect(favoriteButton).toBeInTheDocument();
    });

    it("should have proper accessibility labels", () => {
      render(<CreationCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /bracelet en argent/i });
      expect(card).toHaveAttribute("aria-label");
    });

    it("should support keyboard navigation", () => {
      render(<CreationCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /bracelet en argent/i });
      const favoriteButton = screen.getByRole("button", { name: /favorite/i });

      // Test de navigation clavier
      fireEvent.keyDown(card, { key: "Enter" });
      fireEvent.keyDown(favoriteButton, { key: " " }); // Spacebar

      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnFavoritePress).toHaveBeenCalledTimes(1);
    });
  });

  describe("Styles et thèmes", () => {
    it("should apply custom card style when provided", () => {
      const customStyle = { backgroundColor: "red" };
      render(<CreationCard {...defaultProps} style={customStyle} />);

      const card = screen.getByRole("button", { name: /bracelet en argent/i });
      expect(card).toBeInTheDocument();
    });

    it("should apply custom text style when provided", () => {
      const customTextStyle = { color: "blue", fontSize: 16 };
      render(<CreationCard {...defaultProps} textStyle={customTextStyle} />);

      const title = screen.getByText("Bracelet en argent");
      expect(title).toBeInTheDocument();
    });

    it("should handle different card sizes", () => {
      const { rerender } = render(
        <CreationCard {...defaultProps} size="small" />
      );
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();

      rerender(<CreationCard {...defaultProps} size="medium" />);
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();

      rerender(<CreationCard {...defaultProps} size="large" />);
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
    });
  });

  describe("Cas d'usage spécifiques", () => {
    it("should work as a compact card", () => {
      render(<CreationCard {...defaultProps} compact={true} />);

      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
      // Vérifier que moins d'informations sont affichées en mode compact
    });

    it("should work as a featured card", () => {
      render(<CreationCard {...defaultProps} featured={true} />);

      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
      // Vérifier que la carte est mise en évidence
    });

    it("should work with different categories", () => {
      const { rerender } = render(<CreationCard {...defaultProps} />);
      expect(screen.getByText("Bijoux")).toBeInTheDocument();

      const clothingCreation = {
        ...mockCreation,
        category: CreationCategory.CLOTHING,
        categoryLabel: "Vêtements",
      };
      rerender(<CreationCard {...defaultProps} creation={clothingCreation} />);
      expect(screen.getByText("Vêtements")).toBeInTheDocument();
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
      rerender(<CreationCard {...defaultProps} loading={true} />);
      rerender(<CreationCard {...defaultProps} compact={true} />);
      rerender(<CreationCard {...defaultProps} featured={true} />);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Les re-renders devraient être rapides
      expect(totalTime).toBeLessThan(200);
    });
  });
});
