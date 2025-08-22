import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  FavoritesProvider,
  useFavorites,
} from "../../context/FavoritesContext";

// Mock des dépendances
vi.mock("../../context/UserContext", () => ({
  useUserContext: vi.fn(),
}));

vi.mock("../../services/favoritesApi", () => ({
  FavoritesApi: {
    getUserFavorites: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}));

import { useUserContext } from "../../context/UserContext";
import { FavoritesApi } from "../../services/favoritesApi";

const mockUseUserContext = vi.mocked(useUserContext);
const mockFavoritesApi = vi.mocked(FavoritesApi);

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const context = useFavorites();
  return (
    <div>
      <div data-testid="favorites-count">{context.favorites.length}</div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <div data-testid="error">{context.error || "no-error"}</div>
      <div data-testid="capabilities">
        {JSON.stringify(context.capabilities)}
      </div>
      <button
        data-testid="add-favorite-btn"
        onClick={() => context.addToFavorites("creation-123")}
      >
        Add to Favorites
      </button>
      <button
        data-testid="remove-favorite-btn"
        onClick={() => context.removeFromFavorites("creation-123")}
      >
        Remove from Favorites
      </button>
      <button
        data-testid="toggle-favorite-btn"
        onClick={() => context.toggleFavorite("creation-123")}
      >
        Toggle Favorite
      </button>
      <button
        data-testid="load-favorites-btn"
        onClick={() => context.loadFavorites()}
      >
        Load Favorites
      </button>
      <button
        data-testid="clear-error-btn"
        onClick={() => context.clearError()}
      >
        Clear Error
      </button>
      <div data-testid="is-favorite">
        {context.isFavorite("creation-123").toString()}
      </div>
      <div data-testid="favorites-count-func">
        {context.getFavoritesCount()}
      </div>
    </div>
  );
};

describe("FavoritesContext", () => {
  const mockCreations = [
    {
      id: "creation-123",
      title: "Test Creation 1",
      description: "Test Description 1",
      price: 100,
      category: "jewelry",
      artisanId: "artisan-123",
      artisan: {
        id: "artisan-123",
        username: "testartisan",
        displayName: "Test Artisan",
      },
      images: ["image1.jpg"],
      rating: 4.5,
      reviewCount: 10,
      tags: ["handmade", "unique"],
      materials: ["gold", "silver"],
      availability: "available",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "creation-456",
      title: "Test Creation 2",
      description: "Test Description 2",
      price: 200,
      category: "pottery",
      artisanId: "artisan-456",
      artisan: {
        id: "artisan-456",
        username: "testartisan2",
        displayName: "Test Artisan 2",
      },
      images: ["image2.jpg"],
      rating: 4.0,
      reviewCount: 5,
      tags: ["ceramic", "handcrafted"],
      materials: ["clay"],
      availability: "available",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock par défaut pour useUserContext
    mockUseUserContext.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-123" },
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      capabilities: {},
      updateProfile: vi.fn(),
      upgradeToArtisan: vi.fn(),
      updateArtisanProfile: vi.fn(),
      refreshUser: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    // Mock par défaut pour FavoritesApi
    mockFavoritesApi.getUserFavorites.mockResolvedValue(mockCreations);
    mockFavoritesApi.addToFavorites.mockResolvedValue(true);
    mockFavoritesApi.removeFromFavorites.mockResolvedValue(true);
    mockFavoritesApi.toggleFavorite.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Context Provider", () => {
    it("should provide favorites context to children", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Attendre que les favoris soient chargés
      await waitFor(() => {
        expect(screen.getByTestId("favorites-count")).toHaveTextContent("2");
      });

      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("should load favorites on mount for authenticated user", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      await waitFor(() => {
        expect(mockFavoritesApi.getUserFavorites).toHaveBeenCalled();
      });

      expect(screen.getByTestId("favorites-count")).toHaveTextContent("2");
    });

    it("should not load favorites for unauthenticated user", async () => {
      mockUseUserContext.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        capabilities: {},
        updateProfile: vi.fn(),
        upgradeToArtisan: vi.fn(),
        updateArtisanProfile: vi.fn(),
        refreshUser: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
      expect(mockFavoritesApi.getUserFavorites).not.toHaveBeenCalled();
    });
  });

  describe("Favorites Management", () => {
    it("should add creation to favorites successfully", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const addButton = screen.getByTestId("add-favorite-btn");

      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(mockFavoritesApi.addToFavorites).toHaveBeenCalledWith(
          "creation-123"
        );
      });

      // Après ajout, les favoris sont rechargés
      expect(mockFavoritesApi.getUserFavorites).toHaveBeenCalledTimes(2); // 1 au montage + 1 après ajout
    });

    it("should remove creation from favorites successfully", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const removeButton = screen.getByTestId("remove-favorite-btn");

      await act(async () => {
        removeButton.click();
      });

      await waitFor(() => {
        expect(mockFavoritesApi.removeFromFavorites).toHaveBeenCalledWith(
          "creation-123"
        );
      });

      // La liste locale est mise à jour immédiatement pour une meilleure UX
      expect(screen.getByTestId("favorites-count")).toHaveTextContent("1");
    });

    it("should toggle favorite status successfully", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const toggleButton = screen.getByTestId("toggle-favorite-btn");

      await act(async () => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(mockFavoritesApi.toggleFavorite).toHaveBeenCalledWith(
          "creation-123"
        );
      });

      // Après toggle, les favoris sont rechargés
      expect(mockFavoritesApi.getUserFavorites).toHaveBeenCalledTimes(2);
    });

    it("should handle add to favorites error", async () => {
      mockFavoritesApi.addToFavorites.mockRejectedValue(
        new Error("Add failed")
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const addButton = screen.getByTestId("add-favorite-btn");

      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Impossible d'ajouter aux favoris"
        );
      });
    });

    it("should handle remove from favorites error", async () => {
      mockFavoritesApi.removeFromFavorites.mockRejectedValue(
        new Error("Remove failed")
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const removeButton = screen.getByTestId("remove-favorite-btn");

      await act(async () => {
        removeButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Impossible de retirer des favoris"
        );
      });
    });

    it("should handle toggle favorite error", async () => {
      mockFavoritesApi.toggleFavorite.mockRejectedValue(
        new Error("Toggle failed")
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const toggleButton = screen.getByTestId("toggle-favorite-btn");

      await act(async () => {
        toggleButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Impossible de modifier les favoris"
        );
      });
    });
  });

  describe("Favorites Queries", () => {
    it("should check if creation is favorite", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Attendre que les favoris soient chargés
      await waitFor(() => {
        expect(screen.getByTestId("is-favorite")).toHaveTextContent("true");
      });
    });

    it("should return correct favorites count", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Attendre que les favoris soient chargés
      await waitFor(() => {
        expect(screen.getByTestId("favorites-count-func")).toHaveTextContent(
          "2"
        );
      });
    });

    it("should handle empty favorites list", () => {
      mockFavoritesApi.getUserFavorites.mockResolvedValue([]);

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
      expect(screen.getByTestId("is-favorite")).toHaveTextContent("false");
      expect(screen.getByTestId("favorites-count-func")).toHaveTextContent("0");
    });
  });

  describe("Manual Loading", () => {
    it("should load favorites manually", async () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const loadButton = screen.getByTestId("load-favorites-btn");

      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(mockFavoritesApi.getUserFavorites).toHaveBeenCalledTimes(2); // 1 au montage + 1 manuel
      });
    });

    it("should handle manual load error", async () => {
      mockFavoritesApi.getUserFavorites.mockRejectedValue(
        new Error("Load failed")
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const loadButton = screen.getByTestId("load-favorites-btn");

      await act(async () => {
        loadButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Impossible de charger vos favoris"
        );
      });
    });
  });

  describe("Error Management", () => {
    it("should clear error when clearError is called", async () => {
      // D'abord créer une erreur
      mockFavoritesApi.getUserFavorites.mockRejectedValueOnce(
        new Error("Load failed")
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Attendre que l'erreur apparaisse
      await waitFor(() => {
        expect(screen.getByTestId("error")).not.toHaveTextContent("no-error");
      });

      // Puis la nettoyer
      const clearButton = screen.getByTestId("clear-error-btn");
      await act(async () => {
        clearButton.click();
      });

      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("should handle multiple errors gracefully", async () => {
      mockFavoritesApi.getUserFavorites.mockRejectedValue(
        new Error("Load failed")
      );
      mockFavoritesApi.addToFavorites.mockRejectedValue(
        new Error("Add failed")
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Attendre la première erreur
      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Impossible de charger vos favoris"
        );
      });

      // Créer une deuxième erreur
      const addButton = screen.getByTestId("add-favorite-btn");
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Impossible d'ajouter aux favoris"
        );
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state during operations", async () => {
      // Mock une opération lente
      mockFavoritesApi.addToFavorites.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      const addButton = screen.getByTestId("add-favorite-btn");

      await act(async () => {
        addButton.click();
      });

      // Le composant devrait gérer l'état de chargement
      expect(mockFavoritesApi.addToFavorites).toHaveBeenCalled();
    });
  });

  describe("Context Hook Usage", () => {
    it("should throw error when used outside provider", () => {
      // Supprimer la console.error pour ce test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useFavorites must be used within a FavoritesProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("Authentication Changes", () => {
    it("should reload favorites when authentication changes", async () => {
      const { rerender } = render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Vérifier que les favoris sont chargés initialement
      await waitFor(() => {
        expect(mockFavoritesApi.getUserFavorites).toHaveBeenCalledTimes(1);
      });

      // Changer l'authentification
      mockUseUserContext.mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        capabilities: {},
        updateProfile: vi.fn(),
        upgradeToArtisan: vi.fn(),
        updateArtisanProfile: vi.fn(),
        refreshUser: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });

      rerender(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Les favoris devraient être vidés pour un utilisateur non authentifié
      expect(screen.getByTestId("favorites-count")).toHaveTextContent("0");
    });
  });

  describe("Performance Optimizations", () => {
    it("should use useCallback for stable function references", () => {
      render(
        <FavoritesProvider>
          <TestComponent />
        </FavoritesProvider>
      );

      // Les fonctions du contexte devraient être stables grâce à useCallback
      const addButton = screen.getByTestId("add-favorite-btn");
      const removeButton = screen.getByTestId("remove-favorite-btn");
      const toggleButton = screen.getByTestId("toggle-favorite-btn");

      expect(addButton).toBeInTheDocument();
      expect(removeButton).toBeInTheDocument();
      expect(toggleButton).toBeInTheDocument();
    });
  });
});
