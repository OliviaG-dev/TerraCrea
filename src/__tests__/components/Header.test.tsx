import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Header } from "../../components/Header";

// Mock des styles et couleurs
vi.mock("../../utils/colors", () => ({
  COLORS: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#FFFFFF",
    text: "#000000",
    textPrimary: "#000000",
    textSecondary: "#8E8E93",
    border: "#C6C6C8",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
    cardBackground: "#FFFFFF",
    lightGray: "#F2F2F7",
    black: "#000000",
  },
}));

vi.mock("../../utils/commonStyles", () => ({
  headerStyles: {
    container: { height: 60, backgroundColor: "#FFFFFF" },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { fontSize: 18, fontWeight: "600", color: "#000000" },
    leftButton: { padding: 10 },
    rightButton: { padding: 10 },
    buttonText: { fontSize: 16, color: "#007AFF" },
  },
}));

// Mock de React Navigation
const mockNavigation = {
  navigate: vi.fn(),
  goBack: vi.fn(),
  canGoBack: vi.fn(() => true),
};

vi.mock("@react-navigation/native", () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({
    params: {},
  }),
}));

// Mock de react-native
vi.mock("react-native", () => ({
  View: ({ children, style, ...props }: any) => (
    <div data-testid="view" style={style} {...props}>
      {children}
    </div>
  ),
  Text: ({ children, style, ...props }: any) => (
    <span data-testid="text" style={style} {...props}>
      {children}
    </span>
  ),
  TouchableOpacity: ({ children, onPress, style, ...props }: any) => (
    <button
      data-testid="touchable-opacity"
      onClick={onPress}
      style={style}
      {...props}
    >
      {children}
    </button>
  ),
  SafeAreaView: ({ children, style, ...props }: any) => (
    <div data-testid="safe-area-view" style={style} {...props}>
      {children}
    </div>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe("Header", () => {
  const defaultProps = {
    title: "Test Header",
    showBackButton: false,
    onBackPress: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendu de base", () => {
    it("should render with title", () => {
      render(<Header {...defaultProps} />);

      expect(screen.getByText("Test Header")).toBeInTheDocument();
    });

    it("should render without back button by default", () => {
      render(<Header {...defaultProps} />);

      expect(screen.queryByText("←")).not.toBeInTheDocument();
    });

    it("should handle different titles", () => {
      const { rerender } = render(
        <Header {...defaultProps} title="First Title" />
      );
      expect(screen.getByText("First Title")).toBeInTheDocument();

      rerender(<Header {...defaultProps} title="Second Title" />);
      expect(screen.getByText("Second Title")).toBeInTheDocument();
    });

    it("should handle empty title", () => {
      render(<Header {...defaultProps} title="" />);

      expect(screen.getByText("TerraCréa")).toBeInTheDocument();
    });

    it("should handle very long title", () => {
      const longTitle = "A".repeat(1000);
      render(<Header {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle special characters in title", () => {
      const specialTitle = "Header with émojis 🎉 & symbols @#$%";
      render(<Header {...defaultProps} title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });
  });

  describe("Bouton de retour", () => {
    it("should render back button when showBackButton is true", () => {
      render(<Header {...defaultProps} showBackButton={true} />);

      expect(screen.getByText("←")).toBeInTheDocument();
    });

    it("should not render back button when showBackButton is false", () => {
      render(<Header {...defaultProps} showBackButton={false} />);

      expect(screen.queryByText("←")).not.toBeInTheDocument();
    });

    it("should call onBackPress when back button is pressed", () => {
      const onBackPress = vi.fn();
      render(
        <Header
          {...defaultProps}
          showBackButton={true}
          onBackPress={onBackPress}
        />
      );

      const backButton = screen.getByText("←");
      fireEvent.click(backButton);

      expect(onBackPress).toHaveBeenCalled();
    });

    it("should call navigation.goBack when onBackPress is not provided", () => {
      render(<Header {...defaultProps} showBackButton={true} />);

      const backButton = screen.getByText("←");
      fireEvent.click(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe("Combinaisons de props", () => {
    it("should render with back button and title", () => {
      render(
        <Header {...defaultProps} showBackButton={true} title="Back Header" />
      );

      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.getByText("Back Header")).toBeInTheDocument();
    });

    it("should render with only back button", () => {
      render(<Header {...defaultProps} showBackButton={true} title="" />);

      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.queryByText("TerraCréa")).not.toBeInTheDocument();
    });

    it("should render with minimal props", () => {
      render(<Header title="Minimal" />);

      expect(screen.getByText("Minimal")).toBeInTheDocument();
    });
  });

  describe("Gestion des événements", () => {
    it("should handle back button press multiple times", () => {
      const onBackPress = vi.fn();
      render(
        <Header
          {...defaultProps}
          showBackButton={true}
          onBackPress={onBackPress}
        />
      );

      const backButton = screen.getByText("←");

      fireEvent.click(backButton);
      fireEvent.click(backButton);
      fireEvent.click(backButton);

      expect(onBackPress).toHaveBeenCalledTimes(3);
    });

    it("should handle rapid button presses", () => {
      const onBackPress = vi.fn();
      render(
        <Header
          {...defaultProps}
          showBackButton={true}
          onBackPress={onBackPress}
        />
      );

      const backButton = screen.getByText("←");

      // Appuyer rapidement plusieurs fois
      for (let i = 0; i < 10; i++) {
        fireEvent.click(backButton);
      }

      expect(onBackPress).toHaveBeenCalledTimes(10);
    });
  });

  describe("Cas limites et gestion d'erreurs", () => {
    it("should handle null title gracefully", () => {
      expect(() => {
        render(<Header {...defaultProps} title={null as any} />);
      }).not.toThrow();
    });

    it("should handle undefined title gracefully", () => {
      expect(() => {
        render(<Header {...defaultProps} title={undefined} />);
      }).not.toThrow();
    });

    it("should handle missing callbacks gracefully", () => {
      expect(() => {
        render(
          <Header
            {...defaultProps}
            showBackButton={true}
            onBackPress={undefined}
          />
        );
      }).not.toThrow();
    });
  });

  describe("Performance et re-renders", () => {
    it("should not re-render unnecessarily when props don't change", () => {
      const { rerender } = render(<Header {...defaultProps} />);
      const initialTitle = screen.getByText("Test Header");

      rerender(<Header {...defaultProps} />);
      const reRenderTitle = screen.getByText("Test Header");

      expect(reRenderTitle).toBe(initialTitle);
    });

    it("should handle rapid title changes", () => {
      const { rerender } = render(<Header {...defaultProps} title="Title 1" />);

      for (let i = 2; i <= 10; i++) {
        rerender(<Header {...defaultProps} title={`Title ${i}`} />);
        expect(screen.getByText(`Title ${i}`)).toBeInTheDocument();
      }
    });

    it("should handle rapid button state changes", () => {
      const { rerender } = render(
        <Header {...defaultProps} showBackButton={false} />
      );

      for (let i = 0; i < 10; i++) {
        rerender(<Header {...defaultProps} showBackButton={i % 2 === 0} />);

        if (i % 2 === 0) {
          expect(screen.getByText("←")).toBeInTheDocument();
        } else {
          expect(screen.queryByText("←")).not.toBeInTheDocument();
        }
      }
    });
  });

  describe("Intégration des composants", () => {
    it("should integrate all elements correctly", () => {
      render(
        <Header {...defaultProps} showBackButton={true} title="Back Header" />
      );

      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.getByText("Back Header")).toBeInTheDocument();
    });

    it("should maintain element hierarchy", () => {
      render(<Header {...defaultProps} />);

      const container = screen.getByTestId("safe-area-view");
      const title = screen.getByText("Test Header");

      expect(container).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it("should integrate with different prop combinations", () => {
      // Test avec bouton retour
      const { rerender } = render(
        <Header {...defaultProps} showBackButton={true} title="Back Header" />
      );
      expect(screen.getByText("←")).toBeInTheDocument();
      expect(screen.getByText("Back Header")).toBeInTheDocument();

      // Test sans bouton retour
      rerender(
        <Header
          {...defaultProps}
          showBackButton={false}
          title="Simple Header"
        />
      );
      expect(screen.queryByText("←")).not.toBeInTheDocument();
      expect(screen.getByText("Simple Header")).toBeInTheDocument();
    });
  });
});
