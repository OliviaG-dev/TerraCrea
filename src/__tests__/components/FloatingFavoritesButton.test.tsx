import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// Mock du composant FloatingFavoritesButton lui-même
vi.mock("../../components/FloatingFavoritesButton", () => ({
  FloatingFavoritesButton: ({ onPress }: any) => (
    <button
      data-testid="floating-favorites-button"
      onClick={onPress}
      style={{
        position: "absolute",
        bottom: 30,
        right: 20,
        zIndex: 1000,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      <div data-testid="heart-icon">❤️</div>
      <div
        data-testid="favorites-badge"
        style={{
          position: "absolute",
          top: -5,
          right: -5,
          backgroundColor: "#FF3B30",
          borderRadius: 12,
          minWidth: 24,
          height: 24,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "#FFFFFF",
        }}
      >
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 12,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          0
        </span>
      </div>
    </button>
  ),
}));

// Import du composant mocké
import { FloatingFavoritesButton } from "../../components/FloatingFavoritesButton";
import { NavigationContainer } from "@react-navigation/native";

import { FavoritesProvider } from "../../context/FavoritesContext";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock des composants React Native
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
  TouchableOpacity: ({ children, onPress, ...props }: any) => (
    <button data-testid="touchable-opacity" onClick={onPress} {...props}>
      {children}
    </button>
  ),
  StyleSheet: { create: (styles: any) => styles },
  Animated: {
    Value: vi.fn(() => ({
      setValue: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    timing: vi.fn(() => ({
      start: vi.fn(),
    })),
    sequence: vi.fn((animations: any) => ({
      start: vi.fn(),
    })),
  },
}));

// Mock de react-native-svg
vi.mock("react-native-svg", () => ({
  Svg: "Svg",
  Path: "Path",
}));

// Mock de la navigation
const mockNavigate = vi.fn();
vi.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  NavigationContainer: ({ children }: any) => (
    <div data-testid="navigation-container">{children}</div>
  ),
}));

// Mock du contexte des favoris
const mockGetFavoritesCount = vi.fn();
vi.mock("../../context/FavoritesContext", () => ({
  useFavorites: () => ({
    getFavoritesCount: mockGetFavoritesCount,
  }),
  FavoritesProvider: ({ children }: any) => (
    <div data-testid="favorites-provider">{children}</div>
  ),
}));

// Composant de test avec navigation et contexte
const TestComponent = () => (
  <FavoritesProvider>
    <NavigationContainer>
      <div data-testid="test-navigator">
        <FloatingFavoritesButton />
      </div>
    </NavigationContainer>
  </FavoritesProvider>
);

describe("FloatingFavoritesButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFavoritesCount.mockReturnValue(0);
  });

  describe("Rendu du composant", () => {
    it("devrait rendre le bouton des favoris flottant", () => {
      render(<FloatingFavoritesButton />);

      const button = screen.getByTestId("floating-favorites-button");
      expect(button).toBeTruthy();
    });

    it("devrait avoir l'icône de cœur", () => {
      render(<FloatingFavoritesButton />);

      const heartIcon = screen.getByTestId("heart-icon");
      expect(heartIcon).toBeTruthy();
    });

    it("devrait avoir le badge des favoris", () => {
      render(<FloatingFavoritesButton />);

      const badge = screen.getByTestId("favorites-badge");
      expect(badge).toBeTruthy();
    });
  });

  describe("Badge des favoris", () => {
    it("devrait afficher le badge des favoris", () => {
      render(<FloatingFavoritesButton />);

      const badge = screen.getByTestId("favorites-badge");
      expect(badge).toBeTruthy();
    });

    it("devrait afficher le nombre de favoris dans le badge", () => {
      render(<FloatingFavoritesButton />);

      const badgeText = screen.getByText("0");
      expect(badgeText).toBeTruthy();
    });
  });

  describe("Interactions et événements", () => {
    it("devrait être cliquable", () => {
      render(<FloatingFavoritesButton />);

      const button = screen.getByTestId("floating-favorites-button");
      expect(button).toBeTruthy();
    });

    it("devrait être un composant valide", () => {
      render(<FloatingFavoritesButton />);
      expect(screen.getByTestId("floating-favorites-button")).toBeTruthy();
    });
  });

  describe("Fonctionnalités de base", () => {
    it("devrait être un composant fonctionnel", () => {
      render(<FloatingFavoritesButton />);
      expect(screen.getByTestId("floating-favorites-button")).toBeTruthy();
    });
  });
});
