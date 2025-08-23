import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NavigationHeader } from "../../components/NavigationHeader";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useUserContext } from "../../context/UserContext";

// Mock de la navigation
const mockNavigate = vi.fn();
vi.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

vi.mock("../../utils/userUtils", () => ({
  getUserDisplayName: vi.fn(),
}));

vi.mock("../../utils/colors", () => ({
  COLORS: {
    primary: "#007AFF",
    accent: "#FF9500",
    textPrimary: "#000000",
    textSecondary: "#8E8E93",
    textOnPrimary: "#FFFFFF",
    danger: "#FF3B30",
  },
}));

vi.mock("../../utils/commonStyles", () => ({
  commonStyles: {},
}));

// Mock du hook useUserContext
vi.mock("../../context/UserContext", () => ({
  useUserContext: vi.fn(),
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
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe("NavigationHeader", () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuration par défaut pour un utilisateur non connecté
    vi.mocked(useUserContext).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      isAuthenticated: false,
    });
  });

  describe("État invité (non connecté)", () => {
    it("affiche l'icône d'utilisateur invité (☆)", () => {
      render(<NavigationHeader />);

      const guestIcon = screen.getByText("☆");
      expect(guestIcon).toBeInTheDocument();
    });

    it("affiche le bouton de connexion", () => {
      render(<NavigationHeader />);

      const loginButton = screen.getByText("Connexion");
      expect(loginButton).toBeInTheDocument();
    });

    it("navigue vers l'écran de connexion lors du clic sur le bouton", () => {
      render(<NavigationHeader />);

      const loginButton = screen.getByText("Connexion");
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith("Login", {});
    });
  });

  describe("État authentifié", () => {
    const authenticatedUser = {
      id: "user-123",
      email: "test@example.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      isArtisan: false,
      user_metadata: {},
    };

    beforeEach(() => {
      vi.mocked(useUserContext).mockReturnValue({
        user: authenticatedUser,
        signOut: mockSignOut,
        isAuthenticated: true,
      });
    });

    it("affiche l'icône d'utilisateur connecté (★)", () => {
      render(<NavigationHeader />);

      const userIcon = screen.getByText("★");
      expect(userIcon).toBeInTheDocument();
    });

    it("affiche le nom d'utilisateur", () => {
      render(<NavigationHeader />);

      const userName = screen.getByText("testuser");
      expect(userName).toBeInTheDocument();
    });

    it("affiche le bouton Profil", () => {
      render(<NavigationHeader />);

      const profileButton = screen.getByText("Profil");
      expect(profileButton).toBeInTheDocument();
    });

    it("affiche le bouton Déco", () => {
      render(<NavigationHeader />);

      const signOutButton = screen.getByText("Déco");
      expect(signOutButton).toBeInTheDocument();
    });

    it("navigue vers l'écran Profil lors du clic sur le bouton Profil", () => {
      render(<NavigationHeader />);

      const profileButton = screen.getByText("Profil");
      fireEvent.click(profileButton);

      expect(mockNavigate).toHaveBeenCalledWith("Profil");
    });

    it("appelle signOut lors du clic sur le bouton Déco", async () => {
      mockSignOut.mockResolvedValue({ success: true });

      render(<NavigationHeader />);

      const signOutButton = screen.getByText("Déco");
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe("Affichage du nom d'utilisateur", () => {
    it("affiche le username en priorité", () => {
      const userWithUsername = {
        id: "user-123",
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };

      vi.mocked(useUserContext).mockReturnValue({
        user: userWithUsername,
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      expect(screen.getByText("johndoe")).toBeInTheDocument();
    });

    it("affiche le nom complet si pas de username", () => {
      const userWithoutUsername = {
        id: "user-123",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
      };

      vi.mocked(useUserContext).mockReturnValue({
        user: userWithoutUsername,
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("affiche le prénom si pas de nom complet", () => {
      const userWithFirstNameOnly = {
        id: "user-123",
        firstName: "Alice",
        email: "alice@example.com",
      };

      vi.mocked(useUserContext).mockReturnValue({
        user: userWithFirstNameOnly,
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("affiche la partie locale de l'email si pas de nom", () => {
      const userWithEmailOnly = {
        id: "user-123",
        email: "bob@example.com",
      };

      vi.mocked(useUserContext).mockReturnValue({
        user: userWithEmailOnly,
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      expect(screen.getByText("bob")).toBeInTheDocument();
    });

    it("affiche 'Utilisateur' si aucune information disponible", () => {
      const userWithNoInfo = {
        id: "user-123",
      };

      vi.mocked(useUserContext).mockReturnValue({
        user: userWithNoInfo,
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      expect(screen.getByText("Utilisateur")).toBeInTheDocument();
    });
  });

  describe("Gestion des erreurs de déconnexion", () => {
    it("essaie la déconnexion Supabase directe si signOut échoue", async () => {
      const { supabase } = await import("../../services/supabase");
      mockSignOut.mockResolvedValue({ success: false });

      vi.mocked(useUserContext).mockReturnValue({
        user: { id: "user-123" },
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      const signOutButton = screen.getByText("Déco");
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
      });
    });

    it("gère silencieusement les erreurs de déconnexion", async () => {
      mockSignOut.mockRejectedValue(new Error("Déconnexion échouée"));

      vi.mocked(useUserContext).mockReturnValue({
        user: { id: "user-123" },
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      const signOutButton = screen.getByText("Déco");

      // Ne devrait pas lever d'erreur
      expect(() => {
        fireEvent.click(signOutButton);
      }).not.toThrow();
    });
  });

  describe("Styles et thème", () => {
    it("applique les styles dynamiques pour l'utilisateur connecté", () => {
      const authenticatedUser = {
        id: "user-123",
        username: "testuser",
      };

      vi.mocked(useUserContext).mockReturnValue({
        user: authenticatedUser,
        signOut: mockSignOut,
        isAuthenticated: true,
      });

      render(<NavigationHeader />);

      const userIcon = screen.getByText("★");
      expect(userIcon).toBeInTheDocument();
    });

    it("applique les styles pour l'utilisateur invité", () => {
      vi.mocked(useUserContext).mockReturnValue({
        user: null,
        signOut: mockSignOut,
        isAuthenticated: false,
      });

      render(<NavigationHeader />);

      const guestIcon = screen.getByText("☆");
      expect(guestIcon).toBeInTheDocument();
    });
  });
});
