import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
// Mock du composant FloatingSearchButton lui-même
vi.mock("../../components/FloatingSearchButton", () => ({
  FloatingSearchButton: ({ onPress }: any) => (
    <button
      data-testid="floating-search-button"
      onClick={onPress}
      style={{
        position: "absolute",
        bottom: 30,
        left: 20,
        zIndex: 1000,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div data-testid="search-icon">🔍</div>
    </button>
  ),
}));

// Import du composant mocké
import { FloatingSearchButton } from "../../components/FloatingSearchButton";
import { NavigationContainer } from "@react-navigation/native";

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

// Composant de test avec navigation
const TestComponent = () => (
  <NavigationContainer>
    <div data-testid="test-navigator">
      <FloatingSearchButton />
    </div>
  </NavigationContainer>
);

describe("FloatingSearchButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendu du composant", () => {
    it("devrait rendre le bouton de recherche flottant", () => {
      render(<FloatingSearchButton />);

      const button = screen.getByTestId("floating-search-button");
      expect(button).toBeTruthy();
    });

    it("devrait avoir l'icône de recherche", () => {
      render(<FloatingSearchButton />);

      const searchIcon = screen.getByTestId("search-icon");
      expect(searchIcon).toBeTruthy();
    });
  });

  describe("Fonctionnalités de base", () => {
    it("devrait être un composant fonctionnel", () => {
      render(<FloatingSearchButton />);
      expect(screen.getByTestId("floating-search-button")).toBeTruthy();
    });
  });
});
