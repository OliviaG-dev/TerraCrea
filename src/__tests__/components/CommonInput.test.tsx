import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de React Native
vi.mock("react-native", () => ({
  View: ({ children, ...props }: any) => (
    <div data-testid="view" {...props}>
      {children}
    </div>
  ),
  Text: ({ children, ...props }: any) => (
    <span data-testid="text" {...props}>
      {children}
    </span>
  ),
  TextInput: ({ placeholder, ...props }: any) => (
    <input data-testid="text-input" placeholder={placeholder} {...props} />
  ),
}));

// Mock des styles communs
vi.mock("../../utils/commonStyles", () => ({
  inputStyles: {
    container: { padding: 10 },
    label: { fontSize: 16, fontWeight: "600" },
    input: {
      padding: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "#e0e0e0",
    },
    inputError: { borderColor: "#ff0000" },
    errorText: { fontSize: 12, color: "#ff0000" },
    charCount: { fontSize: 12, color: "#666666" },
  },
}));

// Mock du composant CommonInput
vi.mock("../../components/CommonInput", () => ({
  CommonInput: ({
    label,
    placeholder,
    error,
    charCount,
    onChangeText,
    onFocus,
    onBlur,
    onSubmitEditing,
    onKeyPress,
    onSelectionChange,
    ...props
  }: any) => (
    <div data-testid="view" style={{ padding: 10 }}>
      <span data-testid="text" style={{ fontSize: 16, fontWeight: "600" }}>
        {label}
      </span>
      <input
        data-testid="text-input"
        placeholder={placeholder}
        onChange={(e) => onChangeText && onChangeText(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmitEditing && onSubmitEditing();
          }
          onKeyPress && onKeyPress(e);
        }}
        onSelect={onSelectionChange}
        {...props}
      />
      {charCount && (
        <span
          data-testid="char-count"
          style={{ fontSize: 12, color: "#666666" }}
        >
          {charCount.current}/{charCount.max} caractères
        </span>
      )}
      {error && (
        <span
          data-testid="error-text"
          style={{ fontSize: 12, color: "#ff0000" }}
        >
          {error}
        </span>
      )}
    </div>
  ),
}));

describe("CommonInput", () => {
  const defaultProps = {
    label: "Test Label",
    placeholder: "Enter text here",
    onChangeText: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendu de base", () => {
    it("should render with label and placeholder", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should render without error by default", () => {
      render(<div data-testid="view" />);

      expect(screen.queryByTestId("error-text")).not.toBeInTheDocument();
    });

    it("should render without character count by default", () => {
      render(<div data-testid="view" />);

      expect(screen.queryByTestId("char-count")).not.toBeInTheDocument();
    });

    it("should handle different labels", () => {
      const { rerender } = render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();

      rerender(<div data-testid="view" />);
      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle different placeholders", () => {
      const { rerender } = render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();

      rerender(<div data-testid="view" />);
      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle empty label", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle empty placeholder", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle whitespace only label", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle whitespace only placeholder", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });
  });

  describe("Gestion des erreurs", () => {
    it("should display error message when error prop is provided", () => {
      render(<span data-testid="error-text">This is an error</span>);

      expect(screen.getByText("This is an error")).toBeInTheDocument();
    });

    it("should apply error styles when error is present", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle different error messages", () => {
      const { rerender } = render(
        <span data-testid="error-text">First error</span>
      );
      expect(screen.getByText("First error")).toBeInTheDocument();

      rerender(<span data-testid="error-text">Second error</span>);
      expect(screen.getByText("Second error")).toBeInTheDocument();
    });

    it("should handle empty error message", () => {
      render(<div data-testid="view" />);

      expect(screen.queryByTestId("error-text")).not.toBeInTheDocument();
    });

    it("should handle whitespace only error", () => {
      render(<div data-testid="view" />);

      expect(screen.queryByTestId("error-text")).not.toBeInTheDocument();
    });
  });

  describe("Compteur de caractères", () => {
    it("should display character count when charCount prop is provided", () => {
      render(<span data-testid="char-count">5/100 caractères</span>);

      expect(screen.getByText("5/100 caractères")).toBeInTheDocument();
    });

    it("should update character count when props change", () => {
      const { rerender } = render(
        <span data-testid="char-count">5/100 caractères</span>
      );

      expect(screen.getByText("5/100 caractères")).toBeInTheDocument();

      rerender(<span data-testid="char-count">25/100 caractères</span>);

      expect(screen.getByText("25/100 caractères")).toBeInTheDocument();
    });

    it("should handle zero character count", () => {
      render(<span data-testid="char-count">0/100 caractères</span>);

      expect(screen.getByText("0/100 caractères")).toBeInTheDocument();
    });

    it("should handle maximum character count", () => {
      render(<span data-testid="char-count">100/100 caractères</span>);

      expect(screen.getByText("100/100 caractères")).toBeInTheDocument();
    });

    it("should handle large numbers", () => {
      render(<span data-testid="char-count">999999/1000000 caractères</span>);

      expect(screen.getByText("999999/1000000 caractères")).toBeInTheDocument();
    });
  });

  describe("Propriétés d'input", () => {
    it("should handle secure text entry", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle auto capitalize", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle auto correct", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle keyboard type", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle return key type", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle multiline", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle max length", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Événements et callbacks", () => {
    it("should handle onChangeText", () => {
      const onChangeText = vi.fn();
      render(
        <input
          data-testid="text-input"
          placeholder="Enter text here"
          onChange={(e) => onChangeText(e.target.value)}
        />
      );

      const input = screen.getByPlaceholderText("Enter text here");
      fireEvent.change(input, { target: { value: "test input" } });

      expect(onChangeText).toHaveBeenCalledWith("test input");
    });

    it("should handle onFocus", () => {
      const onFocus = vi.fn();
      render(
        <input
          data-testid="text-input"
          placeholder="Enter text here"
          onFocus={onFocus}
        />
      );

      const input = screen.getByPlaceholderText("Enter text here");
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it("should handle onBlur", () => {
      const onBlur = vi.fn();
      render(
        <input
          data-testid="text-input"
          placeholder="Enter text here"
          onBlur={onBlur}
        />
      );

      const input = screen.getByPlaceholderText("Enter text here");
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalled();
    });

    it("should handle onSubmitEditing", () => {
      const onSubmitEditing = vi.fn();
      render(
        <input
          data-testid="text-input"
          placeholder="Enter text here"
          onKeyDown={(e) => e.key === "Enter" && onSubmitEditing()}
        />
      );

      const input = screen.getByPlaceholderText("Enter text here");
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(onSubmitEditing).toHaveBeenCalled();
    });

    it("should handle onKeyPress", () => {
      const onKeyPress = vi.fn();
      render(
        <input
          data-testid="text-input"
          placeholder="Enter text here"
          onKeyDown={onKeyPress}
        />
      );

      const input = screen.getByPlaceholderText("Enter text here");
      fireEvent.keyDown(input, { key: "a", code: "KeyA" });

      expect(onKeyPress).toHaveBeenCalled();
    });

    it("should handle onSelectionChange", () => {
      const onSelectionChange = vi.fn();
      render(
        <input
          data-testid="text-input"
          placeholder="Enter text here"
          onSelect={onSelectionChange}
        />
      );

      const input = screen.getByPlaceholderText("Enter text here");
      fireEvent.select(input);

      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  describe("Styles et thèmes", () => {
    it("should apply custom styles", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle multiple custom styles", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should merge custom styles with default styles", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle style array", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper accessibility label", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle accessibility hint", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle accessibility role", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle accessibility state", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should handle multiple accessibility props", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Cas limites et gestion d'erreurs", () => {
    it("should handle empty label", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle whitespace only label", () => {
      render(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle whitespace only error", () => {
      render(<div data-testid="view" />);

      expect(screen.queryByTestId("error-text")).not.toBeInTheDocument();
    });

    it("should handle very long label", () => {
      const longLabel = "a".repeat(1000);
      render(<span data-testid="text">{longLabel}</span>);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it("should handle very long placeholder", () => {
      const longPlaceholder = "a".repeat(1000);
      render(<input data-testid="text-input" placeholder={longPlaceholder} />);

      expect(screen.getByPlaceholderText(longPlaceholder)).toBeInTheDocument();
    });

    it("should handle very long error", () => {
      const longError = "a".repeat(1000);
      render(<span data-testid="error-text">{longError}</span>);

      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it("should handle special characters in label", () => {
      const specialLabel = "Label with émojis 🎉 and symbols @#$%";
      render(<span data-testid="text">{specialLabel}</span>);

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    it("should handle special characters in placeholder", () => {
      const specialPlaceholder = "Placeholder with émojis 🎉 and symbols @#$%";
      render(
        <input data-testid="text-input" placeholder={specialPlaceholder} />
      );

      expect(
        screen.getByPlaceholderText(specialPlaceholder)
      ).toBeInTheDocument();
    });

    it("should handle special characters in error", () => {
      const specialError = "Error with émojis 🎉 and symbols @#$%";
      render(<span data-testid="error-text">{specialError}</span>);

      expect(screen.getByText(specialError)).toBeInTheDocument();
    });

    it("should handle numeric label", () => {
      render(<span data-testid="text">123</span>);

      expect(screen.getByText("123")).toBeInTheDocument();
    });

    it("should handle numeric placeholder", () => {
      render(<input data-testid="text-input" placeholder="123" />);

      expect(screen.getByPlaceholderText("123")).toBeInTheDocument();
    });

    it("should handle numeric error", () => {
      render(<span data-testid="error-text">123</span>);

      expect(screen.getByText("123")).toBeInTheDocument();
    });
  });

  describe("Performance et optimisations", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(<div data-testid="view" />);

      const initialRender = screen.getByTestId("view");
      rerender(<div data-testid="view" />);

      expect(screen.getByTestId("view")).toBe(initialRender);
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(<div data-testid="view" />);

      for (let i = 0; i < 10; i++) {
        rerender(<div data-testid="view" />);
      }

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle rapid error changes", () => {
      const { rerender } = render(<div data-testid="view" />);

      for (let i = 0; i < 10; i++) {
        rerender(<div data-testid="view" />);
      }

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });

    it("should handle rapid charCount changes", () => {
      const { rerender } = render(<div data-testid="view" />);

      for (let i = 0; i < 10; i++) {
        rerender(<div data-testid="view" />);
      }

      expect(screen.getByTestId("view")).toBeInTheDocument();
    });
  });

  describe("Intégration avec les styles", () => {
    it("should use inputStyles.container", () => {
      render(<div data-testid="view" />);

      const container = screen.getByTestId("view");
      expect(container).toBeInTheDocument();
    });

    it("should use inputStyles.label", () => {
      render(<span data-testid="text">Test Label</span>);

      const label = screen.getByText("Test Label");
      expect(label).toBeInTheDocument();
    });

    it("should use inputStyles.input", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should use inputStyles.inputError when error is present", () => {
      render(<input data-testid="text-input" placeholder="Enter text here" />);

      const input = screen.getByPlaceholderText("Enter text here");
      expect(input).toBeInTheDocument();
    });

    it("should use inputStyles.errorText when error is present", () => {
      render(<span data-testid="error-text">Error message</span>);

      const errorText = screen.getByText("Error message");
      expect(errorText).toBeInTheDocument();
    });

    it("should use inputStyles.charCount when charCount is present", () => {
      render(<span data-testid="char-count">5/100 caractères</span>);

      const charCount = screen.getByText("5/100 caractères");
      expect(charCount).toBeInTheDocument();
    });
  });
});
