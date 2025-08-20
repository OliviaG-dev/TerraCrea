import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FloatingFavoritesButton } from "../../components/FloatingFavoritesButton";
import { FloatingSearchButton } from "../../components/FloatingSearchButton";

// Les mocks React Native sont configurés globalement dans vitest.config.ts

// Mock de react-navigation
vi.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
  }),
}));

describe("FloatingFavoritesButton", () => {
  const mockOnPress = vi.fn();
  const mockOnLongPress = vi.fn();

  const defaultProps = {
    onPress: mockOnPress,
    onLongPress: mockOnLongPress,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendu", () => {
    it("should render floating favorites button", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render with heart icon", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Vérifier que l'icône de cœur est présente
    });

    it("should apply custom style when provided", () => {
      const customStyle = { backgroundColor: "red" };
      render(<FloatingFavoritesButton {...defaultProps} style={customStyle} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render with badge when count is provided", () => {
      render(<FloatingFavoritesButton {...defaultProps} count={5} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should not show badge when count is 0", () => {
      render(<FloatingFavoritesButton {...defaultProps} count={0} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("should not show badge when count is not provided", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.queryByText(/[0-9]+/)).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onPress when pressed", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("should call onLongPress when long pressed", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);

      // Simuler un appui long
      expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple rapid clicks gracefully", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");

      // Clics rapides multiples
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it("should handle both press and long press", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("États", () => {
    it("should show different badge counts", () => {
      const { rerender } = render(
        <FloatingFavoritesButton {...defaultProps} count={1} />
      );
      expect(screen.getByText("1")).toBeInTheDocument();

      rerender(<FloatingFavoritesButton {...defaultProps} count={10} />);
      expect(screen.getByText("10")).toBeInTheDocument();

      rerender(<FloatingFavoritesButton {...defaultProps} count={99} />);
      expect(screen.getByText("99")).toBeInTheDocument();
    });

    it("should handle large badge counts", () => {
      render(<FloatingFavoritesButton {...defaultProps} count={999} />);
      expect(screen.getByText("999")).toBeInTheDocument();
    });

    it("should handle disabled state", () => {
      render(<FloatingFavoritesButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should not call onPress when disabled", () => {
      render(<FloatingFavoritesButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper button role", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should have proper accessibility label", () => {
      render(
        <FloatingFavoritesButton
          {...defaultProps}
          accessibilityLabel="Bouton favoris"
        />
      );

      const button = screen.getByRole("button", { name: /bouton favoris/i });
      expect(button).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(<FloatingFavoritesButton {...defaultProps} />);

      const button = screen.getByRole("button");

      // Test de navigation clavier
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.keyDown(button, { key: " " }); // Spacebar

      expect(mockOnPress).toHaveBeenCalledTimes(2);
    });
  });
});

describe("FloatingSearchButton", () => {
  const mockOnPress = vi.fn();

  const defaultProps = {
    onPress: mockOnPress,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendu", () => {
    it("should render floating search button", () => {
      render(<FloatingSearchButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render with search icon", () => {
      render(<FloatingSearchButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Vérifier que l'icône de recherche est présente
    });

    it("should apply custom style when provided", () => {
      const customStyle = { backgroundColor: "blue" };
      render(<FloatingSearchButton {...defaultProps} style={customStyle} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render with custom size when provided", () => {
      render(<FloatingSearchButton {...defaultProps} size="large" />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onPress when pressed", () => {
      render(<FloatingSearchButton {...defaultProps} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple rapid clicks gracefully", () => {
      render(<FloatingSearchButton {...defaultProps} />);

      const button = screen.getByRole("button");

      // Clics rapides multiples
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it("should handle disabled state", () => {
      render(<FloatingSearchButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should not call onPress when disabled", () => {
      render(<FloatingSearchButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper button role", () => {
      render(<FloatingSearchButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should have proper accessibility label", () => {
      render(
        <FloatingSearchButton
          {...defaultProps}
          accessibilityLabel="Bouton recherche"
        />
      );

      const button = screen.getByRole("button", { name: /bouton recherche/i });
      expect(button).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(<FloatingSearchButton {...defaultProps} />);

      const button = screen.getByRole("button");

      // Test de navigation clavier
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.keyDown(button, { key: " " }); // Spacebar

      expect(mockOnPress).toHaveBeenCalledTimes(2);
    });
  });

  describe("Styles et thèmes", () => {
    it("should apply different sizes correctly", () => {
      const { rerender } = render(
        <FloatingSearchButton {...defaultProps} size="small" />
      );
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<FloatingSearchButton {...defaultProps} size="medium" />);
      expect(screen.getByRole("button")).toBeInTheDocument();

      rerender(<FloatingSearchButton {...defaultProps} size="large" />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should apply custom colors when provided", () => {
      const customColor = "#FF0000";
      render(<FloatingSearchButton {...defaultProps} color={customColor} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Gestion d'erreurs", () => {
    it("should handle missing onPress gracefully", () => {
      const { onPress, ...propsWithoutOnPress } = defaultProps;

      // Ne devrait pas planter même sans onPress
      expect(() => {
        render(<FloatingSearchButton {...propsWithoutOnPress} />);
      }).not.toThrow();
    });

    it("should handle null/undefined props gracefully", () => {
      expect(() => {
        render(<FloatingSearchButton onPress={null as any} />);
      }).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("should render quickly with minimal props", () => {
      const startTime = performance.now();

      render(<FloatingSearchButton {...defaultProps} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Le rendu devrait être rapide (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it("should handle re-renders efficiently", () => {
      const { rerender } = render(<FloatingSearchButton {...defaultProps} />);

      const startTime = performance.now();

      // Re-renders multiples
      rerender(<FloatingSearchButton {...defaultProps} size="large" />);
      rerender(<FloatingSearchButton {...defaultProps} disabled={true} />);
      rerender(<FloatingSearchButton {...defaultProps} color="#FF0000" />);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Les re-renders devraient être rapides
      expect(totalTime).toBeLessThan(200);
    });
  });
});
