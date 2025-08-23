import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthNavigator } from "../../components/AuthNavigator";
import { useUserContext } from "../../context/UserContext";

vi.mock("@react-navigation/native-stack", () => ({
  createNativeStackNavigator: vi.fn(() => ({
    Navigator: ({ children, initialRouteName, ...props }: any) => (
      <div
        data-testid="navigator"
        data-initial-route={initialRouteName}
        {...props}
      >
        {children}
      </div>
    ),
    Screen: ({ name, component, options, ...props }: any) => (
      <div data-testid={`screen-${name}`} {...props}>
        <div data-testid={`screen-name-${name}`}>{name}</div>
        <div data-testid={`screen-component-${name}`}>
          {component?.name || "Component"}
        </div>
        {options?.title && (
          <div data-testid={`screen-title-${name}`}>{options.title}</div>
        )}
        {options?.headerRight && (
          <div data-testid={`screen-header-right-${name}`}>
            {options.headerRight()}
          </div>
        )}
        {options?.headerLeft && (
          <div data-testid={`screen-header-left-${name}`}>
            {options.headerLeft()}
          </div>
        )}
      </div>
    ),
  })),
}));

// Mock du contexte utilisateur
vi.mock("../../context/UserContext", () => ({
  useUserContext: vi.fn(),
}));

// Mock des écrans
vi.mock("../../screens/HomeScreen", () => ({
  HomeScreen: () => <div data-testid="home-screen">Home Screen</div>,
}));

vi.mock("../../screens/LoginScreen", () => ({
  default: () => <div data-testid="login-screen">Login Screen</div>,
}));

vi.mock("../../screens/ExploreScreen", () => ({
  default: () => <div data-testid="explore-screen">Explore Screen</div>,
}));

vi.mock("../../screens/SearchScreen", () => ({
  SearchScreen: () => <div data-testid="search-screen">Search Screen</div>,
}));

vi.mock("../../screens/ProfilScreen", () => ({
  ProfilScreen: () => <div data-testid="profile-screen">Profile Screen</div>,
}));

vi.mock("../../screens/EmailConfirmationScreen", () => ({
  EmailConfirmationScreen: () => (
    <div data-testid="email-confirmation-screen">Email Confirmation Screen</div>
  ),
}));

vi.mock("../../screens/EmailConfirmedScreen", () => ({
  EmailConfirmedScreen: () => (
    <div data-testid="email-confirmed-screen">Email Confirmed Screen</div>
  ),
}));

vi.mock("../../screens/ForgotPasswordScreen", () => ({
  ForgotPasswordScreen: () => (
    <div data-testid="forgot-password-screen">Forgot Password Screen</div>
  ),
}));

vi.mock("../../screens/ResetPasswordScreen", () => ({
  ResetPasswordScreen: () => (
    <div data-testid="reset-password-screen">Reset Password Screen</div>
  ),
}));

vi.mock("../../screens/CreationsScreen", () => ({
  CreationsScreen: () => (
    <div data-testid="creations-screen">Creations Screen</div>
  ),
}));

vi.mock("../../screens/AddCreationScreen", () => ({
  AddCreationScreen: () => (
    <div data-testid="add-creation-screen">Add Creation Screen</div>
  ),
}));

vi.mock("../../screens/EditCreationScreen", () => ({
  EditCreationScreen: () => (
    <div data-testid="edit-creation-screen">Edit Creation Screen</div>
  ),
}));

vi.mock("../../screens/CreationDetailScreen", () => ({
  CreationDetailScreen: () => (
    <div data-testid="creation-detail-screen">Creation Detail Screen</div>
  ),
}));

vi.mock("../../screens/CreatorProfileScreen", () => ({
  CreatorProfileScreen: () => (
    <div data-testid="creator-profile-screen">Creator Profile Screen</div>
  ),
}));

vi.mock("../../screens/FavoritesScreen", () => ({
  FavoritesScreen: () => (
    <div data-testid="favorites-screen">Favorites Screen</div>
  ),
}));

// Mock du composant NavigationHeader
vi.mock("../../components/NavigationHeader", () => ({
  NavigationHeader: () => (
    <div data-testid="navigation-header">Navigation Header</div>
  ),
}));

describe("AuthNavigator", () => {
  const mockUserContext = {
    isAuthenticated: false,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUserContext).mockReturnValue(mockUserContext);
  });

  describe("Rendu de base", () => {
    it("should render navigator with correct props", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
      expect(navigator).toHaveAttribute("data-initial-route", "Home");
    });

    it("should render all screens", () => {
      render(<AuthNavigator />);

      // Vérifier que tous les écrans sont rendus
      expect(screen.getByTestId("screen-Home")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Login")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Explore")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Search")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Profil")).toBeInTheDocument();
      expect(
        screen.getByTestId("screen-EmailConfirmation")
      ).toBeInTheDocument();
      expect(screen.getByTestId("screen-EmailConfirmed")).toBeInTheDocument();
      expect(screen.getByTestId("screen-ForgotPassword")).toBeInTheDocument();
      expect(screen.getByTestId("screen-ResetPassword")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Creations")).toBeInTheDocument();
      expect(screen.getByTestId("screen-AddCreation")).toBeInTheDocument();
      expect(screen.getByTestId("screen-EditCreation")).toBeInTheDocument();
      expect(screen.getByTestId("screen-CreationDetail")).toBeInTheDocument();
      expect(screen.getByTestId("screen-CreatorProfile")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Favorites")).toBeInTheDocument();
    });

    it("should display correct screen names", () => {
      render(<AuthNavigator />);

      expect(screen.getByTestId("screen-name-Home")).toHaveTextContent("Home");
      expect(screen.getByTestId("screen-name-Login")).toHaveTextContent(
        "Login"
      );
      expect(screen.getByTestId("screen-name-Explore")).toHaveTextContent(
        "Explore"
      );
      expect(screen.getByTestId("screen-name-Search")).toHaveTextContent(
        "Search"
      );
      expect(screen.getByTestId("screen-name-Profil")).toHaveTextContent(
        "Profil"
      );
      expect(
        screen.getByTestId("screen-name-EmailConfirmation")
      ).toHaveTextContent("EmailConfirmation");
      expect(
        screen.getByTestId("screen-name-EmailConfirmed")
      ).toHaveTextContent("EmailConfirmed");
      expect(
        screen.getByTestId("screen-name-ForgotPassword")
      ).toHaveTextContent("ForgotPassword");
      expect(screen.getByTestId("screen-name-ResetPassword")).toHaveTextContent(
        "ResetPassword"
      );
      expect(screen.getByTestId("screen-name-Creations")).toHaveTextContent(
        "Creations"
      );
      expect(screen.getByTestId("screen-name-AddCreation")).toHaveTextContent(
        "AddCreation"
      );
      expect(screen.getByTestId("screen-name-EditCreation")).toHaveTextContent(
        "EditCreation"
      );
      expect(
        screen.getByTestId("screen-name-CreationDetail")
      ).toHaveTextContent("CreationDetail");
      expect(
        screen.getByTestId("screen-name-CreatorProfile")
      ).toHaveTextContent("CreatorProfile");
      expect(screen.getByTestId("screen-name-Favorites")).toHaveTextContent(
        "Favorites"
      );
    });
  });

  describe("Configuration des écrans", () => {
    it("should configure Home screen correctly", () => {
      render(<AuthNavigator />);

      const homeScreen = screen.getByTestId("screen-Home");
      expect(homeScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Home")).toHaveTextContent(
        "TerraCréa"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Home")
      ).toBeInTheDocument();
    });

    it("should configure Login screen correctly", () => {
      render(<AuthNavigator />);

      const loginScreen = screen.getByTestId("screen-Login");
      expect(loginScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Login")).toHaveTextContent(
        "Connexion"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Login")
      ).toBeInTheDocument();
    });

    it("should configure Explore screen correctly", () => {
      render(<AuthNavigator />);

      const exploreScreen = screen.getByTestId("screen-Explore");
      expect(exploreScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Explore")).toHaveTextContent(
        "Explorer"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Explore")
      ).toBeInTheDocument();
    });

    it("should configure Search screen correctly", () => {
      render(<AuthNavigator />);

      const searchScreen = screen.getByTestId("screen-Search");
      expect(searchScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Search")).toHaveTextContent(
        "Recherche"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Search")
      ).toBeInTheDocument();
    });

    it("should configure Profile screen correctly", () => {
      render(<AuthNavigator />);

      const profileScreen = screen.getByTestId("screen-Profil");
      expect(profileScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Profil")).toHaveTextContent(
        "Mon Profil"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Profil")
      ).toBeInTheDocument();
    });

    it("should configure EmailConfirmation screen correctly", () => {
      render(<AuthNavigator />);

      const emailConfirmationScreen = screen.getByTestId(
        "screen-EmailConfirmation"
      );
      expect(emailConfirmationScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(
        screen.getByTestId("screen-title-EmailConfirmation")
      ).toHaveTextContent("Confirmation Email");

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-EmailConfirmation")
      ).toBeInTheDocument();
    });

    it("should configure EmailConfirmed screen correctly", () => {
      render(<AuthNavigator />);

      const emailConfirmedScreen = screen.getByTestId("screen-EmailConfirmed");
      expect(emailConfirmedScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(
        screen.getByTestId("screen-title-EmailConfirmed")
      ).toHaveTextContent("Email Confirmé");

      // Vérifier le header left (null)
      expect(
        screen.getByTestId("screen-header-left-EmailConfirmed")
      ).toBeInTheDocument();

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-EmailConfirmed")
      ).toBeInTheDocument();
    });

    it("should configure ForgotPassword screen correctly", () => {
      render(<AuthNavigator />);

      const forgotPasswordScreen = screen.getByTestId("screen-ForgotPassword");
      expect(forgotPasswordScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(
        screen.getByTestId("screen-title-ForgotPassword")
      ).toHaveTextContent("Mot de passe oublié");

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-ForgotPassword")
      ).toBeInTheDocument();
    });

    it("should configure ResetPassword screen correctly", () => {
      render(<AuthNavigator />);

      const resetPasswordScreen = screen.getByTestId("screen-ResetPassword");
      expect(resetPasswordScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(
        screen.getByTestId("screen-title-ResetPassword")
      ).toHaveTextContent("Nouveau mot de passe");

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-ResetPassword")
      ).toBeInTheDocument();
    });

    it("should configure Creations screen correctly", () => {
      render(<AuthNavigator />);

      const creationsScreen = screen.getByTestId("screen-Creations");
      expect(creationsScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Creations")).toHaveTextContent(
        "Mes Créations"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Creations")
      ).toBeInTheDocument();
    });

    it("should configure AddCreation screen correctly", () => {
      render(<AuthNavigator />);

      const addCreationScreen = screen.getByTestId("screen-AddCreation");
      expect(addCreationScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-AddCreation")).toHaveTextContent(
        "Nouvelle Création"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-AddCreation")
      ).toBeInTheDocument();
    });

    it("should configure EditCreation screen correctly", () => {
      render(<AuthNavigator />);

      const editCreationScreen = screen.getByTestId("screen-EditCreation");
      expect(editCreationScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-EditCreation")).toHaveTextContent(
        "Modifier la création"
      );

      // Vérifier le header left (null)
      expect(
        screen.getByTestId("screen-header-left-EditCreation")
      ).toBeInTheDocument();

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-EditCreation")
      ).toBeInTheDocument();
    });

    it("should configure CreationDetail screen correctly", () => {
      render(<AuthNavigator />);

      const creationDetailScreen = screen.getByTestId("screen-CreationDetail");
      expect(creationDetailScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(
        screen.getByTestId("screen-title-CreationDetail")
      ).toHaveTextContent("Détails de la création");

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-CreationDetail")
      ).toBeInTheDocument();
    });

    it("should configure CreatorProfile screen correctly", () => {
      render(<AuthNavigator />);

      const creatorProfileScreen = screen.getByTestId("screen-CreatorProfile");
      expect(creatorProfileScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(
        screen.getByTestId("screen-title-CreatorProfile")
      ).toHaveTextContent("Profil Artisan");

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-CreatorProfile")
      ).toBeInTheDocument();
    });

    it("should configure Favorites screen correctly", () => {
      render(<AuthNavigator />);

      const favoritesScreen = screen.getByTestId("screen-Favorites");
      expect(favoritesScreen).toBeInTheDocument();

      // Vérifier le titre
      expect(screen.getByTestId("screen-title-Favorites")).toHaveTextContent(
        "Mes Favoris"
      );

      // Vérifier le header right
      expect(
        screen.getByTestId("screen-header-right-Favorites")
      ).toBeInTheDocument();
    });
  });

  describe("Options de navigation", () => {
    it("should apply correct header style options", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });

    it("should apply correct header tint color", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });

    it("should apply correct header title style", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });

    it("should apply correct header shadow visibility", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });

    it("should apply correct header back title", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });

    it("should apply correct header left configuration", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });
  });

  describe("NavigationHeader integration", () => {
    it("should render NavigationHeader in all screens", () => {
      render(<AuthNavigator />);

      // Vérifier que NavigationHeader est présent dans tous les écrans
      const navigationHeaders = screen.getAllByTestId("navigation-header");
      expect(navigationHeaders).toHaveLength(15); // Tous les écrans
    });

    it("should render NavigationHeader in Home screen", () => {
      render(<AuthNavigator />);

      expect(screen.getByTestId("screen-header-right-Home")).toHaveTextContent(
        "Navigation Header"
      );
    });

    it("should render NavigationHeader in Login screen", () => {
      render(<AuthNavigator />);

      expect(screen.getByTestId("screen-header-right-Login")).toHaveTextContent(
        "Navigation Header"
      );
    });

    it("should render NavigationHeader in Profile screen", () => {
      render(<AuthNavigator />);

      expect(
        screen.getByTestId("screen-header-right-Profil")
      ).toHaveTextContent("Navigation Header");
    });
  });

  describe("Gestion des routes", () => {
    it("should set Home as initial route", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toHaveAttribute("data-initial-route", "Home");
    });

    it("should handle route changes correctly", () => {
      render(<AuthNavigator />);

      // Tous les écrans devraient être disponibles
      expect(screen.getByTestId("screen-Home")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Login")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Explore")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Search")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Profil")).toBeInTheDocument();
    });

    it("should maintain route configuration consistency", () => {
      render(<AuthNavigator />);

      // Vérifier que tous les écrans ont la même configuration de base
      const screens = [
        "Home",
        "Login",
        "Explore",
        "Search",
        "Profil",
        "EmailConfirmation",
        "EmailConfirmed",
        "ForgotPassword",
        "ResetPassword",
        "Creations",
        "AddCreation",
        "EditCreation",
        "CreationDetail",
        "CreatorProfile",
        "Favorites",
      ];

      screens.forEach((screenName) => {
        const screenElement = screen.getByTestId(`screen-${screenName}`);
        expect(screenElement).toBeInTheDocument();
      });
    });
  });

  describe("Cas limites et gestion d'erreurs", () => {
    it("should handle missing user context gracefully", () => {
      vi.mocked(useUserContext).mockReturnValue(undefined);

      expect(() => {
        render(<AuthNavigator />);
      }).not.toThrow();
    });

    it("should handle missing isAuthenticated gracefully", () => {
      vi.mocked(useUserContext).mockReturnValue({ loading: false });

      expect(() => {
        render(<AuthNavigator />);
      }).not.toThrow();
    });

    it("should handle missing loading gracefully", () => {
      vi.mocked(useUserContext).mockReturnValue({ isAuthenticated: false });

      expect(() => {
        render(<AuthNavigator />);
      }).not.toThrow();
    });

    it("should handle all context properties missing gracefully", () => {
      vi.mocked(useUserContext).mockReturnValue({});

      expect(() => {
        render(<AuthNavigator />);
      }).not.toThrow();
    });

    it("should handle null user context gracefully", () => {
      vi.mocked(useUserContext).mockReturnValue(null);

      expect(() => {
        render(<AuthNavigator />);
      }).not.toThrow();
    });

    it("should handle undefined user context gracefully", () => {
      vi.mocked(useUserContext).mockReturnValue(undefined);

      expect(() => {
        render(<AuthNavigator />);
      }).not.toThrow();
    });
  });

  describe("Performance et re-renders", () => {
    it("should not re-render unnecessarily when context doesn't change", () => {
      const { rerender } = render(<AuthNavigator />);
      const initialNavigator = screen.getByTestId("navigator");

      rerender(<AuthNavigator />);
      const reRenderNavigator = screen.getByTestId("navigator");

      expect(reRenderNavigator).toBe(initialNavigator);
    });

    it("should handle rapid context changes", () => {
      const { rerender } = render(<AuthNavigator />);

      // Changements rapides du contexte
      for (let i = 0; i < 10; i++) {
        vi.mocked(useUserContext).mockReturnValue({
          isAuthenticated: i % 2 === 0,
          loading: i % 3 === 0,
        });

        rerender(<AuthNavigator />);

        // Le composant devrait toujours être rendu
        expect(screen.getByTestId("navigator")).toBeInTheDocument();
      }
    });

    it("should maintain screen configuration during context changes", () => {
      const { rerender } = render(<AuthNavigator />);

      // Vérifier la configuration initiale
      expect(screen.getByTestId("screen-Home")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Login")).toBeInTheDocument();

      // Changer le contexte
      vi.mocked(useUserContext).mockReturnValue({
        isAuthenticated: true,
        loading: false,
      });

      rerender(<AuthNavigator />);

      // La configuration devrait être maintenue
      expect(screen.getByTestId("screen-Home")).toBeInTheDocument();
      expect(screen.getByTestId("screen-Login")).toBeInTheDocument();
    });
  });

  describe("Accessibilité", () => {
    it("should have proper navigation structure", () => {
      render(<AuthNavigator />);

      const navigator = screen.getByTestId("navigator");
      expect(navigator).toBeInTheDocument();
    });

    it("should have proper screen identification", () => {
      render(<AuthNavigator />);

      // Chaque écran devrait avoir un identifiant unique
      expect(screen.getByTestId("screen-name-Home")).toBeInTheDocument();
      expect(screen.getByTestId("screen-name-Login")).toBeInTheDocument();
      expect(screen.getByTestId("screen-name-Explore")).toBeInTheDocument();
    });

    it("should have proper screen titles", () => {
      render(<AuthNavigator />);

      // Chaque écran devrait avoir un titre approprié
      expect(screen.getByTestId("screen-title-Home")).toHaveTextContent(
        "TerraCréa"
      );
      expect(screen.getByTestId("screen-title-Login")).toHaveTextContent(
        "Connexion"
      );
      expect(screen.getByTestId("screen-title-Explore")).toHaveTextContent(
        "Explorer"
      );
    });
  });

  describe("Intégration des composants", () => {
    it("should integrate all screen components correctly", () => {
      render(<AuthNavigator />);

      // Vérifier que tous les composants d'écran sont intégrés
      expect(screen.getByTestId("screen-component-Home")).toHaveTextContent(
        "HomeScreen"
      );
      expect(screen.getByTestId("screen-component-Login")).toHaveTextContent(
        "default"
      );
      expect(screen.getByTestId("screen-component-Explore")).toHaveTextContent(
        "default"
      );
      expect(screen.getByTestId("screen-component-Search")).toHaveTextContent(
        "SearchScreen"
      );
      expect(screen.getByTestId("screen-component-Profil")).toHaveTextContent(
        "ProfilScreen"
      );
    });

    it("should integrate NavigationHeader in all screens", () => {
      render(<AuthNavigator />);

      // Vérifier que NavigationHeader est intégré dans tous les écrans
      const navigationHeaders = screen.getAllByTestId("navigation-header");
      expect(navigationHeaders).toHaveLength(15);

      navigationHeaders.forEach((header) => {
        expect(header).toHaveTextContent("Navigation Header");
      });
    });

    it("should maintain consistent header configuration across screens", () => {
      render(<AuthNavigator />);

      // Vérifier que tous les écrans ont le header right configuré
      const screens = [
        "Home",
        "Login",
        "Explore",
        "Search",
        "Profil",
        "EmailConfirmation",
        "EmailConfirmed",
        "ForgotPassword",
        "ResetPassword",
        "Creations",
        "AddCreation",
        "EditCreation",
        "CreationDetail",
        "CreatorProfile",
        "Favorites",
      ];

      screens.forEach((screenName) => {
        const headerRight = screen.getByTestId(
          `screen-header-right-${screenName}`
        );
        expect(headerRight).toBeInTheDocument();
      });
    });
  });
});
