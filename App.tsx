import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking, View, Text } from "react-native";

import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { UserProvider } from "./src/context/UserContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import AccessibilityConfig from "./src/utils/accessibilityConfig";
import {
  useEmailConfirmationHandler,
  handleEmailConfirmationLink,
} from "./src/utils/emailConfirmationHandler";
import {
  usePasswordResetHandler,
  handlePasswordResetLink,
} from "./src/utils/passwordResetHandler";
import { RootStackParamList } from "./src/types/Navigation";
import { AuthNavigator } from "./src/components/AuthNavigator";
import {
  checkForPasswordReset,
  extractTokensFromUrl,
  handleResetPasswordUrl,
} from "./src/utils/urlHandler";

// Configuration des liens profonds
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["terracrea://", "http://localhost:19006", "https://yourapp.com"],
  config: {
    screens: {
      Home: "",
      Login: "login",
      Explore: "explore",
      Search: "search",
      Profil: "profil",
      EmailConfirmation: "email-confirmation",
      EmailConfirmed: "email-confirmed",
      ForgotPassword: "forgot-password",
      ResetPassword: "reset-password",
      Favorites: "favorites",
    },
  },
  async getInitialURL() {
    // Vérifier s'il y a une URL de lancement (liens profonds)
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    // Écouter les liens profonds pendant que l'app est active
    const onReceiveURL = ({ url }: { url: string }) => {
      listener(url);
    };

    const subscription = Linking.addEventListener("url", onReceiveURL);

    return () => {
      subscription?.remove();
    };
  },
};

// Composant wrapper pour les écrans avec gestion des confirmations email et réinitialisation de mot de passe
const NavigationHandler = () => {
  // Utiliser les handlers pour les liens profonds
  useEmailConfirmationHandler();
  usePasswordResetHandler();

  return <AuthNavigator />;
};

// Composant NavigationContainer principal
const RootNavigator = () => {
  return (
    <NavigationContainer
      linking={linking}
      onStateChange={(state) => {}}
      onReady={() => {
        // Gérer les liens profonds au démarrage de l'app
        Linking.getInitialURL().then((url) => {
          if (url) {
            // Traiter le lien selon son type
            if (url.includes("reset-password")) {
              handlePasswordResetLink(url, {} as any);
            } else if (url.includes("email-confirmed")) {
              handleEmailConfirmationLink(url, {} as any);
            }
          }
        });
      }}
    >
      <NavigationHandler />
    </NavigationContainer>
  );
};

export default function App() {
  // Version simplifiée pour diagnostic
  try {
    // Initialiser la configuration d'accessibilité
    useEffect(() => {
      try {
        AccessibilityConfig.configureOverlayAccessibility();
      } catch (error) {
        console.log("Erreur AccessibilityConfig:", error);
      }
    }, []);

    return (
      <UserProvider>
        <FavoritesProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </FavoritesProvider>
      </UserProvider>
    );
  } catch (error) {
    console.error("Erreur dans App.tsx:", error);
    // Fallback en cas d'erreur
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>
          Erreur de chargement:{" "}
          {error instanceof Error ? error.message : "Erreur inconnue"}
        </Text>
      </View>
    );
  }
}
