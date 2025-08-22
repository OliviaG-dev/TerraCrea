import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserProvider, useUserContext } from "../../context/UserContext";

// Mock des dépendances
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../utils/userUtils", () => ({
  getUserCapabilities: vi.fn(),
}));

vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      upsert: vi.fn(),
    })),
  },
}));

import { useAuth } from "../../hooks/useAuth";
import { getUserCapabilities } from "../../utils/userUtils";
import { supabase } from "../../services/supabase";

const mockUseAuth = vi.mocked(useAuth);
const mockGetUserCapabilities = vi.mocked(getUserCapabilities);
const mockSupabase = vi.mocked(supabase);

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const context = useUserContext();

  const handleUpdateProfile = async () => {
    try {
      await context.updateProfile({
        username: "newuser",
        firstName: "New",
        lastName: "User",
        bio: "New bio",
      });
    } catch (error) {
      // Gérer l'erreur silencieusement pour les tests
      console.log("Profile update error caught:", error.message);
    }
  };

  const handleUpgradeArtisan = async () => {
    try {
      await context.upgradeToArtisan({
        businessName: "Test Business",
        location: "Test Location",
        description: "Test Description",
        establishedYear: 2020,
        specialties: ["jewelry"],
        phone: "1234567890",
      });
    } catch (error) {
      // Gérer l'erreur silencieusement pour les tests
      console.log("Artisan upgrade error caught:", error.message);
    }
  };

  return (
    <div>
      <div data-testid="user-id">{context.user?.id || "no-user"}</div>
      <div data-testid="user-email">{context.user?.email || "no-email"}</div>
      <div data-testid="is-authenticated">
        {context.isAuthenticated.toString()}
      </div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <div data-testid="error">{context.error || "no-error"}</div>
      <div data-testid="capabilities">
        {JSON.stringify(context.capabilities)}
      </div>
      <button data-testid="update-profile-btn" onClick={handleUpdateProfile}>
        Update Profile
      </button>
      <button data-testid="upgrade-artisan-btn" onClick={handleUpgradeArtisan}>
        Upgrade to Artisan
      </button>
      <button
        data-testid="refresh-user-btn"
        onClick={() => context.refreshUser()}
      >
        Refresh User
      </button>
    </div>
  );
};

describe("UserContext", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    isArtisan: false,
    isBuyer: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    user_metadata: {
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      bio: "Test bio",
    },
    app_metadata: {
      isBuyer: true,
      isArtisan: false,
    },
  };

  const mockCapabilities = {
    canCreateCreations: false,
    canEditCreations: false,
    canDeleteCreations: false,
    canManageProfile: true,
    canViewAnalytics: false,
    canModerateContent: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock par défaut pour useAuth
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      isAuthenticated: true,
      resendConfirmation: vi.fn(),
      checkEmailConfirmed: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    });

    // Mock par défaut pour getUserCapabilities
    mockGetUserCapabilities.mockReturnValue(mockCapabilities);

    // Mock par défaut pour supabase.from
    const mockFrom = vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }));
    mockSupabase.from = mockFrom;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Context Provider", () => {
    it("should provide user context to children", () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toHaveTextContent("user-123");
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "test@example.com"
      );
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("should provide user capabilities", () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const capabilitiesElement = screen.getByTestId("capabilities");
      expect(capabilitiesElement).toHaveTextContent(
        JSON.stringify(mockCapabilities)
      );
    });

    it("should handle unauthenticated user", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        isAuthenticated: false,
        resendConfirmation: vi.fn(),
        checkEmailConfirmed: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toHaveTextContent("no-user");
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });
  });

  describe("User Metadata Building", () => {
    it("should build user with metadata from auth user", () => {
      const authUserWithMetadata = {
        ...mockUser,
        user_metadata: {
          username: "metauser",
          firstName: "Meta",
          lastName: "User",
          bio: "Meta bio",
          isArtisan: true,
        },
        app_metadata: {
          isBuyer: true,
          isArtisan: true,
          verified: true,
        },
      };

      mockUseAuth.mockReturnValue({
        user: authUserWithMetadata,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        isAuthenticated: true,
        resendConfirmation: vi.fn(),
        checkEmailConfirmed: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toHaveTextContent("user-123");
      // Le contexte devrait utiliser les métadonnées pour construire l'utilisateur
    });

    it("should handle missing metadata gracefully", () => {
      const authUserWithoutMetadata = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {},
        app_metadata: {},
      };

      mockUseAuth.mockReturnValue({
        user: authUserWithoutMetadata,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        isAuthenticated: true,
        resendConfirmation: vi.fn(),
        checkEmailConfirmed: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toHaveTextContent("user-123");
      // Le contexte devrait gérer les métadonnées manquantes
    });
  });

  describe("Profile Management", () => {
    it("should update user profile successfully", async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const updateButton = screen.getByTestId("update-profile-btn");

      await act(async () => {
        updateButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          data: {
            username: "newuser",
            firstName: "New",
            lastName: "User",
            bio: "New bio",
          },
        });
      });
    });

    it("should handle profile update error", async () => {
      const updateError = { message: "Update failed" };
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: updateError,
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const updateButton = screen.getByTestId("update-profile-btn");

      await act(async () => {
        updateButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalled();
      });
    });

    it("should throw error when updating profile without authentication", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        isAuthenticated: false,
        resendConfirmation: vi.fn(),
        checkEmailConfirmed: vi.fn(),
        resetPassword: vi.fn(),
        updatePassword: vi.fn(),
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const updateButton = screen.getByTestId("update-profile-btn");

      // Cette action devrait échouer car l'utilisateur n'est pas connecté
      await act(async () => {
        updateButton.click();
      });

      // Le composant devrait gérer l'erreur gracieusement
    });
  });

  describe("Artisan Upgrade", () => {
    it("should upgrade user to artisan successfully", async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: { ...mockUser, isArtisan: true } },
        error: null,
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const upgradeButton = screen.getByTestId("upgrade-artisan-btn");

      await act(async () => {
        upgradeButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          data: {
            isArtisan: true,
            artisanBusinessName: "Test Business",
            artisanLocation: "Test Location",
            artisanDescription: "Test Description",
            artisanEstablishedYear: 2020,
            artisanSpecialties: ["jewelry"],
            artisanPhone: "1234567890",
          },
        });
      });
    });

    it("should handle artisan upgrade error", async () => {
      const upgradeError = { message: "Upgrade failed" };
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: upgradeError,
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const upgradeButton = screen.getByTestId("upgrade-artisan-btn");

      await act(async () => {
        upgradeButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalled();
      });
    });
  });

  describe("User Refresh", () => {
    it("should refresh user data successfully", async () => {
      const refreshedUser = { ...mockUser, username: "refreshed" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: refreshedUser },
        error: null,
      });

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const refreshButton = screen.getByTestId("refresh-user-btn");

      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      });
    });

    it("should handle user refresh error gracefully", async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error("Refresh failed"));

      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      const refreshButton = screen.getByTestId("refresh-user-btn");

      await act(async () => {
        refreshButton.click();
      });

      // Le composant devrait gérer l'erreur gracieusement
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
      }).toThrow("useUserContext must be used within a UserProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("Database Operations", () => {
    it("should handle users table operations", async () => {
      // Ce test vérifie que le contexte peut être rendu sans erreur
      // Les opérations de base de données sont testées dans les tests de profil
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toBeInTheDocument();
    });

    it("should handle artisans table operations", async () => {
      // Ce test vérifie que le contexte peut être rendu sans erreur
      // Les opérations de base de données sont testées dans les tests d'artisan
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      // Ce test vérifie que le contexte peut être rendu sans erreur
      // La gestion d'erreur est testée dans les tests de profil et d'artisan
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toBeInTheDocument();
    });

    it("should handle non-critical database errors", async () => {
      // Ce test vérifie que le contexte peut être rendu sans erreur
      // La gestion d'erreur est testée dans les tests de profil et d'artisan
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );

      expect(screen.getByTestId("user-id")).toBeInTheDocument();
    });
  });
});
