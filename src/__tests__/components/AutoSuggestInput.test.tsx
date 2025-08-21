import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AutoSuggestInput } from "../../components/AutoSuggestInput";

// Les mocks React Native sont configurés globalement dans vitest.config.ts

describe("AutoSuggestInput", () => {
  const mockOnChangeText = vi.fn();
  const mockOnSuggestionSelect = vi.fn();
  const mockOnSuggestionsFetchRequested = vi.fn();
  const mockOnSuggestionsClearRequested = vi.fn();

  const defaultProps = {
    value: "",
    onChangeText: mockOnChangeText,
    placeholder: "Search...",
    suggestions: [],
    onSuggestionSelect: mockOnSuggestionSelect,
    onSuggestionsFetchRequested: mockOnSuggestionsFetchRequested,
    onSuggestionsClearRequested: mockOnSuggestionsClearRequested,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Affichage", () => {
    it("should display placeholder text", () => {
      render(<AutoSuggestInput {...defaultProps} />);
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("should display current value", () => {
      render(<AutoSuggestInput {...defaultProps} value="test value" />);
      expect(screen.getByDisplayValue("test value")).toBeInTheDocument();
    });

    it("should show suggestions when typing", () => {
      const suggestions = [
        { id: "1", text: "Bracelet en argent" },
        { id: "2", text: "Collier en or" },
      ];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="bracelet"
          suggestions={suggestions}
        />
      );

      // Seule "Bracelet en argent" devrait être visible car elle contient "bracelet"
      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
      // "Collier en or" ne devrait PAS être visible car il ne contient pas "bracelet"
      expect(screen.queryByText("Collier en or")).not.toBeInTheDocument();
    });

    it("should limit suggestions to maxSuggestions", () => {
      const suggestions = [
        { id: "1", text: "test suggestion 1" },
        { id: "2", text: "test suggestion 2" },
        { id: "3", text: "test suggestion 3" },
        { id: "4", text: "test suggestion 4" },
        { id: "5", text: "test suggestion 5" },
        { id: "6", text: "test suggestion 6" },
      ];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={suggestions}
          maxSuggestions={3}
        />
      );

      // Seules les 3 premières suggestions contenant "test" devraient être visibles
      expect(screen.getByText("test suggestion 1")).toBeInTheDocument();
      expect(screen.getByText("test suggestion 2")).toBeInTheDocument();
      expect(screen.getByText("test suggestion 3")).toBeInTheDocument();
      // La 4ème ne devrait pas être visible à cause de la limite maxSuggestions
      expect(screen.queryByText("test suggestion 4")).not.toBeInTheDocument();
    });

    it("should filter suggestions based on input", () => {
      const suggestions = [
        { id: "1", text: "Bracelet en argent" },
        { id: "2", text: "Collier en or" },
        { id: "3", text: "Bague en diamant" },
      ];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="bracelet"
          suggestions={suggestions}
        />
      );

      expect(screen.getByText("Bracelet en argent")).toBeInTheDocument();
      expect(screen.queryByText("Collier en or")).not.toBeInTheDocument();
      expect(screen.queryByText("Bague en diamant")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onChangeText when typing", () => {
      render(<AutoSuggestInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(mockOnChangeText).toHaveBeenCalledWith("new value");
    });

    it("should call onSuggestionSelect when suggestion is pressed", () => {
      const suggestions = [{ id: "1", text: "Test suggestion" }];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={suggestions}
        />
      );

      fireEvent.click(screen.getByText("Test suggestion"));

      expect(mockOnSuggestionSelect).toHaveBeenCalledWith(suggestions[0]);
    });

    it("should hide suggestions after selecting one", () => {
      const suggestions = [{ id: "1", text: "Test suggestion" }];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={suggestions}
        />
      );

      // Vérifier que la suggestion est visible
      expect(screen.getByText("Test suggestion")).toBeInTheDocument();

      // Sélectionner la suggestion
      fireEvent.click(screen.getByText("Test suggestion"));

      // Vérifier que la suggestion n'est plus visible
      expect(screen.queryByText("Test suggestion")).not.toBeInTheDocument();
    });

    it("should show suggestions on focus when value exists", () => {
      const suggestions = [{ id: "1", text: "Test suggestion" }];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={suggestions}
        />
      );

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.focus(input);

      expect(screen.getByText("Test suggestion")).toBeInTheDocument();
    });
  });

  describe("Callbacks", () => {
    it("should call onSuggestionsFetchRequested when typing", () => {
      render(<AutoSuggestInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "test" } });

      expect(mockOnSuggestionsFetchRequested).toHaveBeenCalledWith("test");
    });

    it("should call onSuggestionsClearRequested when clearing input", () => {
      render(<AutoSuggestInput {...defaultProps} value="test" />);

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnSuggestionsClearRequested).toHaveBeenCalled();
    });

    it("should not call onSuggestionsFetchRequested for empty input", () => {
      render(<AutoSuggestInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "" } });

      expect(mockOnSuggestionsFetchRequested).not.toHaveBeenCalled();
    });
  });

  describe("États et gestion d'erreurs", () => {
    it("should handle empty suggestions array", () => {
      render(
        <AutoSuggestInput {...defaultProps} value="test" suggestions={[]} />
      );

      // Ne devrait pas planter et ne pas afficher de suggestions
      expect(screen.queryByText("Test suggestion")).not.toBeInTheDocument();
    });

    it("should handle null/undefined suggestions gracefully", () => {
      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={null as any}
        />
      );

      // Ne devrait pas planter et ne pas afficher de suggestions
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
      expect(screen.queryByText("Test suggestion")).not.toBeInTheDocument();
    });

    it("should not show suggestions when value is empty", () => {
      const suggestions = [{ id: "1", text: "Test suggestion" }];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value=""
          suggestions={suggestions}
        />
      );

      expect(screen.queryByText("Test suggestion")).not.toBeInTheDocument();
    });

    it("should handle suggestions with missing text property", () => {
      const suggestions = [
        { id: "1", text: "Valid test suggestion" }, // Contient "test" pour correspondre à la valeur
        { id: "2", text: "" }, // Empty text property
      ] as any; // Cast to any to test handling of invalid data

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={suggestions}
        />
      );

      // Devrait afficher la suggestion valide qui contient "test"
      expect(screen.getByText("Valid test suggestion")).toBeInTheDocument();
      // Ne devrait pas planter sur la suggestion invalide
      // Le composant devrait filtrer les suggestions invalides automatiquement
    });
  });

  describe("Accessibilité", () => {
    it("should have proper input attributes", () => {
      render(<AutoSuggestInput {...defaultProps} />);

      const input = screen.getByPlaceholderText("Search...");
      expect(input).toHaveAttribute("placeholder", "Search...");
    });

    it("should handle keyboard navigation", () => {
      const suggestions = [{ id: "1", text: "Test suggestion" }];

      render(
        <AutoSuggestInput
          {...defaultProps}
          value="test"
          suggestions={suggestions}
        />
      );

      const input = screen.getByPlaceholderText("Search...");

      // Test de navigation clavier basique
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.keyDown(input, { key: "Escape" });

      // Ne devrait pas planter
      expect(input).toBeInTheDocument();
    });
  });
});
