import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommonHeader } from "../../components/CommonHeader";

// Les mocks React Native sont configurés globalement dans vitest.config.ts

// Mock de react-navigation
vi.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: vi.fn(),
    navigate: vi.fn(),
  }),
}));

describe("CommonHeader", () => {
  const mockOnBackPress = vi.fn();
  const mockOnRightPress = vi.fn();

  const defaultProps = {
    title: "Test Header",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Affichage", () => {
    it("should display title correctly", () => {
      render(<CommonHeader {...defaultProps} />);
      expect(screen.getByText("Test Header")).toBeInTheDocument();
    });

    it("should display different titles", () => {
      const { rerender } = render(<CommonHeader title="Header 1" />);
      expect(screen.getByText("Header 1")).toBeInTheDocument();

      rerender(<CommonHeader title="Header 2" />);
      expect(screen.getByText("Header 2")).toBeInTheDocument();
    });

    it("should handle long titles", () => {
      const longTitle =
        "This is a very long header title that might cause layout issues";
      render(<CommonHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle special characters in title", () => {
      const specialTitle = "Header with émojis 🎉 and spécial chars!";
      render(<CommonHeader title={specialTitle} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it("should handle empty title gracefully", () => {
      render(<CommonHeader title="" />);
      // Le composant rend toujours un header même avec un titre vide
      // Utiliser getAllByText pour gérer les multiples éléments
      const emptyTextElements = screen.getAllByText("");
      expect(emptyTextElements.length).toBeGreaterThan(0);
    });
  });

  describe("Bouton retour", () => {
    it("should show back button when onBack is provided", () => {
      render(<CommonHeader {...defaultProps} onBack={mockOnBackPress} />);

      const backButton = screen.getByText("←");
      expect(backButton).toBeInTheDocument();
    });

    it("should hide back button when onBack is not provided", () => {
      render(<CommonHeader {...defaultProps} />);

      const backButton = screen.queryByText("←");
      expect(backButton).not.toBeInTheDocument();
    });

    it("should handle back button press", () => {
      render(<CommonHeader {...defaultProps} onBack={mockOnBackPress} />);

      const backButton = screen.getByText("←");
      fireEvent.click(backButton);

      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it("should use custom back label when provided", () => {
      render(
        <CommonHeader
          {...defaultProps}
          onBack={mockOnBackPress}
          backLabel="Retour personnalisé"
        />
      );

      const backButton = screen.getByText("←");
      expect(backButton).toBeInTheDocument();
      // Vérifier que le label d'accessibilité est correct
      expect(
        backButton.closest('[aria-label="Retour personnalisé"]')
      ).toBeInTheDocument();
    });
  });

  describe("Bouton droit", () => {
    it("should show right button when rightButton.text is provided", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      const rightButton = screen.getByText("Action");
      expect(rightButton).toBeInTheDocument();
    });

    it("should hide right button when rightButton is not provided", () => {
      render(<CommonHeader {...defaultProps} />);

      const rightButton = screen.queryByText("Action");
      expect(rightButton).not.toBeInTheDocument();
    });

    it("should handle right button press", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      const rightButton = screen.getByText("Action");
      fireEvent.click(rightButton);

      expect(mockOnRightPress).toHaveBeenCalledTimes(1);
    });

    it("should show loading state when rightButton.loading is true", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
            loading: true,
          }}
        />
      );

      // Vérifier que l'indicateur de chargement est présent
      const loadingIndicator = screen.getByTestId("activity-indicator");
      expect(loadingIndicator).toBeInTheDocument();
    });

    it("should handle disabled state when rightButton.disabled is true", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
            disabled: true,
          }}
        />
      );

      const rightButton = screen.getByText("Action");
      expect(rightButton).toBeInTheDocument();
      // Le bouton devrait être désactivé
      expect(rightButton.closest("button")).toHaveAttribute("disabled");
    });

    it("should handle favorites button style when rightButton.isFavorites is true", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Favoris",
            onPress: mockOnRightPress,
            isFavorites: true,
          }}
        />
      );

      const favoritesButton = screen.getByText("Favoris");
      expect(favoritesButton).toBeInTheDocument();
    });

    it("should handle custom button when rightButton.customButton is provided", () => {
      const CustomButton = () => (
        <button data-testid="custom-button">Custom</button>
      );

      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            onPress: mockOnRightPress,
            customButton: <CustomButton />,
          }}
        />
      );

      const customButton = screen.getByTestId("custom-button");
      expect(customButton).toBeInTheDocument();
    });
  });

  describe("Styles et thèmes", () => {
    it("should apply header container styles", () => {
      render(<CommonHeader {...defaultProps} />);

      // Utiliser getAllByTestId et sélectionner le premier (le container principal)
      const headerElements = screen.getAllByTestId("view");
      const mainHeader = headerElements[0]; // Le premier est le container principal
      expect(mainHeader).toBeInTheDocument();
    });

    it("should apply title styles", () => {
      render(<CommonHeader {...defaultProps} />);

      const title = screen.getByText("Test Header");
      expect(title).toBeInTheDocument();
    });

    it("should apply back button styles", () => {
      render(<CommonHeader {...defaultProps} onBack={mockOnBackPress} />);

      const backButton = screen.getByText("←");
      expect(backButton).toBeInTheDocument();
    });

    it("should apply right button styles", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      const rightButton = screen.getByText("Action");
      expect(rightButton).toBeInTheDocument();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper accessibility attributes for back button", () => {
      render(<CommonHeader {...defaultProps} onBack={mockOnBackPress} />);

      const backButton = screen.getByText("←");
      expect(backButton).toBeInTheDocument();
      // Vérifier les attributs d'accessibilité
      expect(backButton.closest('[aria-label="Retour"]')).toBeInTheDocument();
    });

    it("should have proper accessibility attributes for right button", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      const rightButton = screen.getByText("Action");
      expect(rightButton).toBeInTheDocument();
      // Vérifier les attributs d'accessibilité
      expect(rightButton.closest('[aria-label="Action"]')).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(
        <CommonHeader
          {...defaultProps}
          onBack={mockOnBackPress}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      const backButton = screen.getByText("←");
      const rightButton = screen.getByText("Action");

      // Simuler la navigation clavier
      expect(() => {
        fireEvent.keyDown(backButton, { key: "Enter" });
        fireEvent.keyDown(rightButton, { key: "Enter" });
      }).not.toThrow();
    });
  });

  describe("Gestion d'erreurs", () => {
    it("should handle missing onBack gracefully", () => {
      render(<CommonHeader {...defaultProps} />);

      // Le composant devrait se rendre sans erreur même sans onBack
      expect(screen.getByText("Test Header")).toBeInTheDocument();
    });

    it("should handle missing rightButton gracefully", () => {
      render(<CommonHeader {...defaultProps} />);

      // Le composant devrait se rendre sans erreur même sans rightButton
      expect(screen.getByText("Test Header")).toBeInTheDocument();
    });

    it("should handle null/undefined props gracefully", () => {
      expect(() => {
        render(<CommonHeader title={null as any} />);
      }).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should render quickly", () => {
      const startTime = performance.now();

      render(<CommonHeader {...defaultProps} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Moins de 100ms
    });

    it("should handle re-renders efficiently", () => {
      const { rerender } = render(<CommonHeader {...defaultProps} />);

      const startTime = performance.now();

      rerender(<CommonHeader title="New Title" />);

      const endTime = performance.now();
      const reRenderTime = endTime - startTime;

      expect(reRenderTime).toBeLessThan(50); // Moins de 50ms
    });
  });

  describe("Cas d'usage spécifiques", () => {
    it("should work as a header with only back button", () => {
      render(<CommonHeader {...defaultProps} onBack={mockOnBackPress} />);

      expect(screen.getByText("Test Header")).toBeInTheDocument();
      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.queryByText("Action")).not.toBeInTheDocument();
    });

    it("should work as a header with only right button", () => {
      render(
        <CommonHeader
          {...defaultProps}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      expect(screen.getByText("Test Header")).toBeInTheDocument();
      expect(screen.queryByText("←")).not.toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("should work as a full header with both buttons", () => {
      render(
        <CommonHeader
          {...defaultProps}
          onBack={mockOnBackPress}
          rightButton={{
            text: "Action",
            onPress: mockOnRightPress,
          }}
        />
      );

      expect(screen.getByText("Test Header")).toBeInTheDocument();
      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    it("should work as a minimal header with no buttons", () => {
      render(<CommonHeader {...defaultProps} />);

      expect(screen.getByText("Test Header")).toBeInTheDocument();
      expect(screen.queryByText("←")).not.toBeInTheDocument();
      expect(screen.queryByText("Action")).not.toBeInTheDocument();
    });
  });
});
